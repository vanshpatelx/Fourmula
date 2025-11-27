import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('=== REBUILD FORECAST FUNCTION STARTED ===')
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Environment check:')
    console.log('SUPABASE_URL exists:', !!Deno.env.get('SUPABASE_URL'))
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    console.log('Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Parsing request body...')
    const body = await req.json()
    console.log('Request body:', body)
    
    const { user_id } = body
    
    if (!user_id) {
      console.log('ERROR: Missing user_id')
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    console.log(`Processing forecast for user: ${user_id}`)
    
    // Get cycle baseline
    console.log('Fetching cycle baseline...')
    const { data: baseline, error: baselineError } = await supabase
      .from('cycle_baselines')
      .select('*')
      .eq('user_id', user_id)
      .single()
    
    console.log('Baseline result:', { baseline, baselineError })
    
    if (baselineError || !baseline) {
      console.error('Baseline error:', baselineError)
      return new Response(
        JSON.stringify({ error: 'Cycle baseline not found', details: baselineError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        },
      )
    }

    // Get cycle events
    console.log('Fetching cycle events...')
    const { data: events, error: eventsError } = await supabase
      .from('cycle_events')
      .select('*')
      .eq('user_id', user_id)
      .eq('type', 'period')
      .order('date', { ascending: false })
      .limit(3)
    
    console.log('Events result:', { events, eventsError })
    
    // Generate forecasts
    console.log('Generating forecasts...')
    const forecasts = []
    const cycleLength = baseline.avg_cycle_len
    const lutealLength = baseline.luteal_len
    
    // Use most recent period or baseline
    let startDate = new Date(baseline.last_period_start)
    if (events && events.length > 0) {
      const recentPeriod = new Date(events[0].date)
      if (recentPeriod > startDate) {
        startDate = recentPeriod
      }
    }
    
    console.log(`Start date: ${startDate.toISOString().split('T')[0]}, cycle: ${cycleLength}`)
    
    // Generate 90 days of forecasts
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      
      const dayInCycle = (i % cycleLength) + 1
      let phase = 'follicular'
      let confidence = 0.8
      
      if (dayInCycle <= 5) {
        phase = 'menstrual'
        confidence = 0.9
      } else if (dayInCycle <= (cycleLength - lutealLength)) {
        phase = 'follicular'
        confidence = 0.8
      } else if (dayInCycle <= (cycleLength - lutealLength + 3)) {
        phase = 'ovulatory'
        confidence = 0.7
      } else {
        phase = 'luteal'
        confidence = 0.8
      }
      
      forecasts.push({
        user_id,
        date: date.toISOString().split('T')[0],
        phase,
        confidence
      })
    }
    
    console.log(`Generated ${forecasts.length} forecasts`)
    
    // Delete existing forecasts
    console.log('Deleting existing forecasts...')
    const { error: deleteError } = await supabase
      .from('phase_forecasts')
      .delete()
      .eq('user_id', user_id)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
    } else {
      console.log('Successfully deleted existing forecasts')
    }
    
    // Insert new forecasts
    console.log('Inserting new forecasts...')
    const { error: insertError } = await supabase
      .from('phase_forecasts')
      .insert(forecasts)
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert forecasts', details: insertError }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }
    
    console.log('SUCCESS: Forecasts inserted successfully')
    
    return new Response(
      JSON.stringify({
        success: true,
        forecastsGenerated: forecasts.length,
        user_id,
        startDate: startDate.toISOString().split('T')[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error('FATAL ERROR:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        type: error.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})