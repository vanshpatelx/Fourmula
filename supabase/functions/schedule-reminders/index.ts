import { Resend } from 'npm:resend@4.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

interface Database {
  public: {
    Tables: {
      reminder_plans: {
        Row: {
          user_id: string
          regimen: string
          time_local: string
          timezone: string
          quiet_hours_on: boolean
          reminders_enabled: boolean
        }
      }
      phase_forecasts: {
        Row: {
          user_id: string
          date: string
          phase: string
        }
      }
      reminder_events: {
        Row: {
          user_id: string
          scheduled_for: string
          status: string
          channel: string
        }
        Insert: {
          user_id: string
          scheduled_for: string
          status?: string
          channel?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting reminder scheduling check...')

    // Get current time
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Skip during quiet hours (10 PM - 7 AM)
    const isQuietHours = currentHour >= 22 || currentHour < 7
    
    // Get all active reminder plans with reminders enabled
    const { data: reminderPlans, error: plansError } = await supabaseClient
      .from('reminder_plans')
      .select('*')
      .eq('reminders_enabled', true)
    
    if (plansError) {
      console.error('Error fetching reminder plans:', plansError)
      throw plansError
    }

    console.log(`Found ${reminderPlans?.length || 0} reminder plans`)

    const remindersToSend = []

    for (const plan of reminderPlans || []) {
      // Skip if quiet hours are enabled and it's currently quiet hours
      if (plan.quiet_hours_on && isQuietHours) {
        continue
      }

      // Parse reminder time
      const [reminderHour, reminderMinute] = plan.time_local.split(':').map(Number)
      
      // Check if it's time for this reminder (within 10-minute window)
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (reminderHour * 60 + reminderMinute))
      
      if (timeDiff <= 10) {
        // Check if reminder already sent today
        const today = now.toISOString().split('T')[0]
        const { data: existingReminder } = await supabaseClient
          .from('reminder_events')
          .select('*')
          .eq('user_id', plan.user_id)
          .gte('scheduled_for', `${today}T00:00:00`)
          .lt('scheduled_for', `${today}T23:59:59`)
          .single()

        if (!existingReminder) {
          // Check regimen to see if reminder is needed today
          let shouldSendReminder = false

          if (plan.regimen === 'daily') {
            shouldSendReminder = true
          } else if (plan.regimen === 'luteal_only' || plan.regimen === 'luteal_menstrual') {
            // Check current phase for this user
            const { data: todayPhase } = await supabaseClient
              .from('phase_forecasts')
              .select('phase')
              .eq('user_id', plan.user_id)
              .eq('date', today)
              .single()

            if (todayPhase) {
              if (plan.regimen === 'luteal_only' && todayPhase.phase === 'luteal') {
                shouldSendReminder = true
              } else if (plan.regimen === 'luteal_menstrual' && 
                         (todayPhase.phase === 'luteal' || todayPhase.phase === 'menstrual')) {
                shouldSendReminder = true
              }
            }
          }

          if (shouldSendReminder) {
            // Get user email from auth
            const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(plan.user_id)
            
            if (userError || !user?.email) {
              console.error('Error fetching user email:', userError)
              continue
            }

            // Send email notification
            try {
              const regimenText = plan.regimen === 'daily' ? 'daily' : 
                                  plan.regimen === 'luteal_only' ? 'luteal phase' :
                                  plan.regimen === 'luteal_menstrual' ? 'luteal and menstrual phase' : 
                                  plan.regimen

              await resend.emails.send({
                from: 'Supplement Reminders <onboarding@resend.dev>',
                to: [user.email],
                subject: '💊 Time for Your Supplement!',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                      <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">💊 Supplement Reminder</h1>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
                        Hi! This is your reminder to take your ${regimenText} supplements.
                      </p>
                      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <p style="color: #374151; font-size: 14px; margin: 0;">
                          <strong>Scheduled Time:</strong> ${plan.time_local} (${plan.timezone})
                        </p>
                      </div>
                      <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest', '')}" 
                         style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        View Dashboard
                      </a>
                      <p style="color: #6b7280; font-size: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        To disable these reminders, visit your settings page.
                      </p>
                    </div>
                  </div>
                `,
              })

              console.log('Email notification sent to:', user.email)

              remindersToSend.push({
                user_id: plan.user_id,
                scheduled_for: now.toISOString(),
                status: 'sent',
                channel: 'email'
              })
            } catch (emailError) {
              console.error('Error sending email notification:', emailError)
              // Continue even if email fails
            }
          }
        }
      }
    }

    // Insert reminder events
    if (remindersToSend.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('reminder_events')
        .insert(remindersToSend)

      if (insertError) {
        console.error('Error inserting reminder events:', insertError)
        throw insertError
      }

      console.log(`Sent ${remindersToSend.length} email reminders`)
    } else {
      console.log('No reminders to send at this time')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent: remindersToSend.length,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in schedule-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})