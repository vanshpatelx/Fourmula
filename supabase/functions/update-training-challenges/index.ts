import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { user_id } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // Update training-related challenges
    const { data: challenges } = await supabaseClient
      .from('challenges')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')

    if (!challenges || challenges.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active challenges' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    for (const challenge of challenges) {
      if (challenge.challenge_type === 'training_week') {
        // Count training sessions in last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const { count } = await supabaseClient
          .from('training_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .gte('date', sevenDaysAgo.toISOString().split('T')[0])

        if (count !== null && count > challenge.progress) {
          const status = count >= challenge.target ? 'completed' : 'active'
          await supabaseClient
            .from('challenges')
            .update({ 
              progress: count,
              status,
              completed_at: status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', challenge.id)
        }
      } else if (challenge.challenge_type === 'training_month') {
        // Count training sessions in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { count } = await supabaseClient
          .from('training_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

        if (count !== null && count > challenge.progress) {
          const status = count >= challenge.target ? 'completed' : 'active'
          await supabaseClient
            .from('challenges')
            .update({ 
              progress: count,
              status,
              completed_at: status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', challenge.id)
        }
      }
    }

    // Check for workout warrior achievement
    const { count: totalWorkouts } = await supabaseClient
      .from('training_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)

    if (totalWorkouts && totalWorkouts >= 12) {
      const { data: existing } = await supabaseClient
        .from('achievements')
        .select('id')
        .eq('user_id', user_id)
        .eq('achievement_type', 'workout_warrior')
        .maybeSingle()

      if (!existing) {
        await supabaseClient
          .from('achievements')
          .insert({
            user_id: user_id,
            achievement_type: 'workout_warrior',
            earned_at: new Date().toISOString()
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
