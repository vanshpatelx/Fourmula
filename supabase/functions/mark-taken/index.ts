import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface Database {
  public: {
    Tables: {
      adherence_logs: {
        Row: {
          id: string
          user_id: string
          date: string
          taken: boolean
          streak_count: number
        }
        Insert: {
          user_id: string
          date: string
          taken: boolean
          streak_count?: number
        }
        Update: {
          taken?: boolean
          streak_count?: number
        }
      }
      reminder_events: {
        Row: {
          id: string
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
        Update: {
          status?: string
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

    const { user_id, date, taken } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    const takenDate = date || new Date().toISOString().split('T')[0]
    const isTaken = taken !== undefined ? taken : true

    console.log(`Marking supplement as ${isTaken ? 'taken' : 'not taken'} for user: ${user_id} on ${takenDate}`)

    // Calculate current streak
    let streakDays = 0
    const currentDate = new Date(takenDate)
    
    for (let i = 0; i < 365; i++) { // Check last year
      const checkDate = new Date(currentDate)
      checkDate.setDate(checkDate.getDate() - i)
      const checkDateStr = checkDate.toISOString().split('T')[0]
      
      const { data: takenOnDate } = await supabaseClient
        .from('adherence_logs')
        .select('taken')
        .eq('user_id', user_id)
        .eq('date', checkDateStr)
        .maybeSingle()

      if (takenOnDate?.taken) {
        streakDays++
      } else {
        break // Streak broken
      }
    }

    // If marking as taken today, add 1 to streak
    if (isTaken) {
      streakDays++
    }

    // Upsert adherence log
    const { error: upsertError } = await supabaseClient
      .from('adherence_logs')
      .upsert({
        user_id,
        date: takenDate,
        taken: isTaken,
        streak_count: streakDays
      }, {
        onConflict: 'user_id,date'
      })

    if (upsertError) {
      console.error('Error upserting adherence log:', upsertError)
      throw upsertError
    }

    console.log(`Updated adherence log: taken=${isTaken}, streak=${streakDays}`)

    // Update challenges progress if taken
    if (isTaken) {
      await updateChallengeProgress(supabaseClient, user_id, takenDate, streakDays)
      await checkAchievements(supabaseClient, user_id, streakDays)
    }

    // Also update/create reminder event for tracking
    const { data: sentReminder } = await supabaseClient
      .from('reminder_events')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'sent')
      .gte('scheduled_for', `${takenDate}T00:00:00`)
      .lt('scheduled_for', `${takenDate}T23:59:59`)
      .maybeSingle()

    if (sentReminder) {
      await supabaseClient
        .from('reminder_events')
        .update({ status: 'taken' })
        .eq('id', sentReminder.id)
    } else {
      await supabaseClient
        .from('reminder_events')
        .insert([{
          user_id,
          scheduled_for: new Date().toISOString(),
          status: 'taken',
          channel: 'manual'
        }])
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Supplement marked as ${isTaken ? 'taken' : 'not taken'}`,
        streak_days: streakDays,
        date: takenDate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in mark-taken function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Helper function to update challenge progress
async function updateChallengeProgress(supabaseClient: any, userId: string, date: string, streak: number) {
  try {
    // Get active challenges
    const { data: challenges } = await supabaseClient
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (!challenges || challenges.length === 0) return

    for (const challenge of challenges) {
      let newProgress = challenge.progress
      let shouldUpdate = false

      if (challenge.challenge_type === '7_day_challenge' || challenge.challenge_type === 'perfect_fortnight') {
        // Count consecutive days
        const today = new Date(date)
        const daysToCheck = challenge.challenge_type === 'perfect_fortnight' ? 14 : 7
        let consecutiveDays = 0
        for (let i = 0; i < daysToCheck; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(checkDate.getDate() - i)
          const { data } = await supabaseClient
            .from('adherence_logs')
            .select('taken')
            .eq('user_id', userId)
            .eq('date', checkDate.toISOString().split('T')[0])
            .maybeSingle()
          
          if (data?.taken) consecutiveDays++
          else break
        }
        if (consecutiveDays > newProgress) {
          newProgress = consecutiveDays
          shouldUpdate = true
        }
      } else if (challenge.challenge_type === 'consistency_month') {
        // Count total days in last 30 days
        const { count } = await supabaseClient
          .from('adherence_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('taken', true)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        
        if (count !== null && count > newProgress) {
          newProgress = count
          shouldUpdate = true
        }
      } else if (challenge.challenge_type === 'early_riser') {
        // Count days logged before 8 AM in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const { data: earlyLogs } = await supabaseClient
          .from('adherence_logs')
          .select('created_at')
          .eq('user_id', userId)
          .eq('taken', true)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        
        let earlyCount = 0
        earlyLogs?.forEach(log => {
          const logTime = new Date(log.created_at)
          if (logTime.getHours() < 8) earlyCount++
        })
        
        if (earlyCount > newProgress) {
          newProgress = earlyCount
          shouldUpdate = true
        }
      }

      if (shouldUpdate) {
        const status = newProgress >= challenge.target ? 'completed' : 'active'
        await supabaseClient
          .from('challenges')
          .update({ 
            progress: newProgress,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', challenge.id)
      }
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error)
  }
}

// Helper function to check and unlock achievements
async function checkAchievements(supabaseClient: any, userId: string, streak: number) {
  try {
    // Count total adherence days
    const { count: totalDays } = await supabaseClient
      .from('adherence_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('taken', true)

    const achievements = [
      { type: 'first_week', condition: (totalDays ?? 0) >= 7 },
      { type: 'perfect_week', condition: streak >= 7 },
      { type: 'month_champion', condition: (totalDays ?? 0) >= 30 },
      { type: 'streak_master', condition: streak >= 14 },
    ]

    for (const achievement of achievements) {
      if (achievement.condition) {
        // Check if already earned
        const { data: existing } = await supabaseClient
          .from('achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_type', achievement.type)
          .maybeSingle()

        if (!existing) {
          await supabaseClient
            .from('achievements')
            .insert({
              user_id: userId,
              achievement_type: achievement.type,
              earned_at: new Date().toISOString()
            })
          console.log(`Unlocked achievement: ${achievement.type}`)
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

console.info('mark-taken function started')