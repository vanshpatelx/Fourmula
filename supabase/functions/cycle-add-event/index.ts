import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { type, date } = await req.json();

    // Validate input
    if (!type || !date) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing type or date' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate event type
    const validTypes = ['period_start', 'period_end', 'ovulation_edit'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid event type' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Map event types to database values
    const eventTypeMap = {
      'period_start': 'period',
      'period_end': 'period_end',
      'ovulation_edit': 'ovulation'
    };

    // Insert the cycle event
    const { data, error } = await supabase
      .from('cycle_events')
      .upsert({
        user_id: user.id,
        date: date,
        type: eventTypeMap[type as keyof typeof eventTypeMap]
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to save cycle event' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log analytics event
    console.log(`AI action: ${type} for user ${user.id} on ${date}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully logged ${type.replace('_', ' ')} for ${date}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in cycle-add-event function:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});