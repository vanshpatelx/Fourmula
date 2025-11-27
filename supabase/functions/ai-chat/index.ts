import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { action, messages, logData, tool_call, requireApproval, tool_data, userName } = await req.json();

    // Handle approved tool execution
    if (action === 'execute_tool' && tool_data) {
      const { functionName, functionArgs, functionUrl, requestBody } = tool_data;
      
      console.log(`Executing approved tool: ${functionName}`, functionArgs);
      
      // Execute based on function type
      if (functionName === 'log_symptoms_notes' || functionName === 'log_symptoms_complete') {
        // Build symptom log data
        const logData: any = {
          user_id: user.id,
          date: functionArgs.date,
          notes: functionArgs.notes || null,
          mood: functionArgs.mood || null,
          energy: functionArgs.energy || null,
          sleep: functionArgs.sleep || null,
          cramps: functionArgs.cramps || null,
          bloating: functionArgs.bloating || null
        };

        // Add complete symptom fields if present
        if (functionName === 'log_symptoms_complete') {
          logData.bleeding_flow = functionArgs.bleeding_flow || null;
          logData.mood_states = functionArgs.mood_states || null;
          logData.craving_types = functionArgs.craving_types || null;
          logData.cravings = functionArgs.cravings || null;
          logData.headache = functionArgs.headache || null;
          logData.breast_tenderness = functionArgs.breast_tenderness || null;
          logData.nausea = functionArgs.nausea || null;
          logData.chills = functionArgs.chills || null;
          logData.dizziness = functionArgs.dizziness || null;
          logData.gas = functionArgs.gas || null;
          logData.hot_flushes = functionArgs.hot_flushes || null;
          logData.stress_headache = functionArgs.stress_headache || null;
          logData.toilet_issues = functionArgs.toilet_issues || null;
          logData.ovulation = functionArgs.ovulation || null;
          logData.training_load = functionArgs.training_load || null;
        }

        const { error: logError } = await supabase
          .from('symptom_logs')
          .upsert(logData, {
            onConflict: 'user_id,date'
          });
        
        if (logError) throw logError;
        
        return new Response(JSON.stringify({ 
          success: true,
          message: `✅ Symptoms logged for ${functionArgs.date}!`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (functionName === 'log_training') {
        const { error: trainingError } = await supabase
          .from('training_logs')
          .upsert({
            user_id: user.id,
            date: functionArgs.date,
            workout_types: functionArgs.workout_types || [],
            training_load: functionArgs.training_load || null,
            soreness: functionArgs.soreness || null,
            fatigue: functionArgs.fatigue || null,
            pb_type: functionArgs.pb_type || null,
            pb_value: functionArgs.pb_value || null,
            notes: functionArgs.notes || null
          });
        
        if (trainingError) throw trainingError;
        
        return new Response(JSON.stringify({ 
          success: true,
          message: `✅ Training logged for ${functionArgs.date}!`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (functionUrl) {
        // For cycle events
        const toolResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const toolResult = await toolResponse.json();
        
        if (toolResult.success) {
          // Rebuild forecast
          await fetch(`${supabaseUrl}/functions/v1/rebuild-forecast`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id }),
          });
        }
        
        return new Response(
          JSON.stringify({ success: true, message: '✅ Action completed!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle tool calls from the frontend
    if (action === 'tool_call') {
      const { tool_name, tool_args } = tool_call;
      
      console.log(`AI tool call: ${tool_name} with args:`, tool_args);
      
      // Call the appropriate edge function based on tool name
      let functionUrl;
      let requestBody = {};
      
      switch (tool_name) {
        case 'log_period_start':
          functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
          requestBody = { type: 'period_start', date: tool_args.date };
          break;
        case 'log_period_end':
          functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
          requestBody = { type: 'period_end', date: tool_args.date };
          break;
        case 'edit_ovulation_date':
          functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
          requestBody = { type: 'ovulation_edit', date: tool_args.date };
          break;
        case 'undo_last_cycle_event':
          functionUrl = `${supabaseUrl}/functions/v1/cycle-undo-last`;
          break;
        default:
          return new Response(
            JSON.stringify({ success: false, message: 'Unknown tool' }),
            { 
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }
      
      // Call the edge function
      const toolResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const toolResult = await toolResponse.json();
      
      if (toolResult.success) {
        // Rebuild forecast after successful tool call
        const rebuildResponse = await fetch(`${supabaseUrl}/functions/v1/rebuild-forecast`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: user.id }),
        });
        
        if (!rebuildResponse.ok) {
          console.error('Failed to rebuild forecast');
        }
      }
      
      return new Response(
        JSON.stringify(toolResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'chat') {
      // Get user profile for personalized responses
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get cycle baseline data
      const { data: cycleBaseline } = await supabase
        .from('cycle_baselines')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get current date for context
      const today = new Date().toISOString().split('T')[0];

      // Get current phase from forecast
      const { data: currentPhase } = await supabase
        .from('phase_forecasts')
        .select('phase, confidence')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      // Get recent training and wellness data for context (extended to 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

      const { data: trainingLogs } = await supabase
        .from('training_logs')
        .select('date, training_load, workout_types, soreness, fatigue, pb_type, pb_value, notes')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgoStr)
        .order('date', { ascending: false });

      const { data: wellnessLogs } = await supabase
        .from('symptom_logs')
        .select('date, mood, energy, sleep, cramps, bloating, bleeding_flow, notes, mood_states, craving_types, headache, breast_tenderness, nausea')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgoStr)
        .order('date', { ascending: false });

      // Get adherence/supplement data
      const { data: adherenceLogs } = await supabase
        .from('adherence_logs')
        .select('date, taken, streak_count')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgoStr)
        .order('date', { ascending: false });

      const { data: adherenceGoals } = await supabase
        .from('adherence_goals')
        .select('goal_type, training_goal_days, target_streak, target_days, reminder_time, active')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      // Get full cycle events history (last 6 months for pattern analysis)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

      const { data: cycleEvents } = await supabase
        .from('cycle_events')
        .select('date, type')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgoStr)
        .order('date', { ascending: false });

      // Get reminder preferences
      const { data: reminderPlan } = await supabase
        .from('reminder_plans')
        .select('regimen, time_local, phase_a_time, phase_b_time, reminders_enabled, phase_a_training_days_only, days_of_week')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get user goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Get recent personal bests for celebration
      const recentPBs = trainingLogs?.filter(log => log.pb_type && log.pb_value).slice(0, 5) || [];

      // Calculate statistics
      const trainingCount = trainingLogs?.length || 0;
      const avgMood = wellnessLogs?.length ? 
        wellnessLogs.reduce((sum, log) => sum + (log.mood || 0), 0) / wellnessLogs.length : 0;
      const avgEnergy = wellnessLogs?.length ? 
        wellnessLogs.reduce((sum, log) => sum + (log.energy || 0), 0) / wellnessLogs.length : 0;
      const avgSleep = wellnessLogs?.length ? 
        wellnessLogs.reduce((sum, log) => sum + (log.sleep || 0), 0) / wellnessLogs.length : 0;

      // Calculate adherence statistics
      const last7Days = adherenceLogs?.slice(0, 7) || [];
      const last30Days = adherenceLogs || [];
      const adherence7Days = last7Days.length > 0 ? 
        last7Days.filter(log => log.taken).length : 0;
      const adherence30Days = last30Days.length > 0 ? 
        last30Days.filter(log => log.taken).length : 0;
      const adherenceRate7 = last7Days.length > 0 ? 
        Math.round((adherence7Days / last7Days.length) * 100) : 0;
      const adherenceRate30 = last30Days.length > 0 ? 
        Math.round((adherence30Days / last30Days.length) * 100) : 0;
      const currentStreak = adherenceLogs?.[0]?.streak_count || 0;

      // Calculate training consistency
      const weeksInMonth = 4;
      const sessionsPerWeek = trainingCount / weeksInMonth;

      // Calculate cycle regularity from events
      const periodStarts = cycleEvents?.filter(e => e.type === 'period_start') || [];
      const cycleLengths: number[] = [];
      for (let i = 0; i < periodStarts.length - 1; i++) {
        const date1 = new Date(periodStarts[i].date);
        const date2 = new Date(periodStarts[i + 1].date);
        const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
        cycleLengths.push(diffDays);
      }
      const avgCycleLength = cycleLengths.length > 0 ?
        Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 0;
      const cycleVariation = cycleLengths.length > 1 ?
        Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;

      // Build comprehensive user context
      const userContext = `
═══════════════════════════════════════════════════════════════
USER PROFILE & CONTEXT - YOU ALREADY HAVE ALL THIS INFORMATION
═══════════════════════════════════════════════════════════════

BASIC INFORMATION:
- Name: ${userName || profile?.display_name || 'User'}
- Region: ${profile?.region || 'Not specified'}
- Country: ${profile?.country || 'Not specified'}
- Timezone: ${profile?.timezone || 'Not specified'}
- Today's date: ${today}

MENSTRUAL CYCLE & HEALTH:
${cycleBaseline ? `- Last period started: ${cycleBaseline.last_period_start}
- Average cycle length: ${cycleBaseline.avg_cycle_len} days
- Luteal phase length: ${cycleBaseline.luteal_len} days` : '- No cycle baseline data yet'}
${currentPhase ? `- Current cycle phase: ${currentPhase.phase} (${Math.round((currentPhase.confidence || 0) * 100)}% confidence)` : '- Current phase: Unknown'}
- Cycle regularity: ${profile?.cycle_regularity || 'Not specified'}
- Contraception: ${profile?.contraception_type || 'None specified'}
- Trying to conceive: ${profile?.trying_to_conceive ? 'Yes' : 'No'}
- Known conditions: ${profile?.known_conditions?.join(', ') || 'None specified'}
- Common PMS symptoms: ${profile?.common_pms_symptoms?.join(', ') || 'Not specified'}

FITNESS & TRAINING:
- Training styles: ${profile?.training_styles?.join(', ') || 'Not specified'}
- Fitness goals: ${profile?.fitness_goals?.join(', ') || 'Not specified'}
- Weekly training goal: ${profile?.weekly_training_goal || 'Not set'} sessions
- Preferred session length: ${profile?.session_length || 'Not specified'}

LIFESTYLE:
- Sleep quality: ${profile?.sleep_quality || 'Not specified'}
- Stress level: ${profile?.stress_level || 'Not specified'}
- Height: ${profile?.height_cm ? `${profile.height_cm} cm` : 'Not specified'}
- Weight: ${profile?.weight_kg ? `${profile.weight_kg} kg` : 'Not specified'}
- Birth year: ${profile?.birth_year || 'Not specified'}

SUPPLEMENT ADHERENCE & HABITS:
${adherenceGoals ? `- Goal: ${adherenceGoals.goal_type === 'daily_supplement' ? 'Daily supplement intake' : adherenceGoals.goal_type}
- Target streak: ${adherenceGoals.target_streak} days
- Reminder time: ${adherenceGoals.reminder_time || 'Not set'}` : '- No active adherence goals'}
${adherenceLogs && adherenceLogs.length > 0 ? `- Current streak: ${currentStreak} days 🔥
- Last 7 days: ${adherence7Days}/${last7Days.length} taken (${adherenceRate7}%)
- Last 30 days: ${adherence30Days}/${last30Days.length} taken (${adherenceRate30}%)` : '- No adherence data logged yet'}
${reminderPlan ? `- Supplement regimen: ${reminderPlan.regimen}
- Reminders ${reminderPlan.reminders_enabled ? 'enabled' : 'disabled'}
- Reminder schedule: ${reminderPlan.regimen === 'cycle_synced' ? `Phase A at ${reminderPlan.phase_a_time || 'not set'}, Phase B at ${reminderPlan.phase_b_time || 'not set'}` : `Daily at ${reminderPlan.time_local || 'not set'}`}` : ''}

CYCLE HISTORY (Last 6 months):
${periodStarts.length > 0 ? `- Total periods tracked: ${periodStarts.length}
- Most recent periods: ${periodStarts.slice(0, 3).map(e => e.date).join(', ')}
${avgCycleLength > 0 ? `- Calculated average cycle: ${avgCycleLength} days
- Cycle variation: ${cycleVariation} days (${cycleVariation < 4 ? 'Very regular' : cycleVariation < 7 ? 'Regular' : cycleVariation < 10 ? 'Somewhat irregular' : 'Irregular'})` : ''}` : '- No cycle events tracked yet'}
${cycleEvents?.filter(e => e.type === 'ovulation').length ? `- Ovulation dates logged: ${cycleEvents.filter(e => e.type === 'ovulation').slice(0, 3).map(e => e.date).join(', ')}` : ''}

GOALS & ASPIRATIONS:
${goals && goals.length > 0 ? goals.map(g => 
  `- ${g.title}${g.target_date ? ` (Target: ${g.target_date})` : ''}${g.description ? `: ${g.description}` : ''}`
).join('\n') : '- No goals set yet'}

PERSONAL BESTS & ACHIEVEMENTS:
${recentPBs.length > 0 ? recentPBs.map(pb => 
  `🏆 ${pb.date}: ${pb.pb_type} - ${pb.pb_value}`
).join('\n') : '- No recent PRs logged'}

RECENT ACTIVITY (Last 90 days):
- Training sessions logged: ${trainingCount}
- Training consistency: ${sessionsPerWeek.toFixed(1)} sessions/week ${trainingCount >= (profile?.weekly_training_goal || 3) * weeksInMonth ? '✅ Meeting goal!' : ''}
- Average mood: ${avgMood > 0 ? `${avgMood.toFixed(1)}/4 (${avgMood >= 3.5 ? 'Great' : avgMood >= 2.5 ? 'Good' : avgMood >= 1.5 ? 'Fair' : 'Low'})` : 'No data'}
- Average energy: ${avgEnergy > 0 ? `${avgEnergy.toFixed(1)}/4 (${avgEnergy >= 3.5 ? 'High' : avgEnergy >= 2.5 ? 'Good' : avgEnergy >= 1.5 ? 'Fair' : 'Low'})` : 'No data'}
- Average sleep: ${avgSleep > 0 ? `${avgSleep.toFixed(1)}/4` : 'No data'}

${trainingLogs && trainingLogs.length > 0 ? `
RECENT TRAINING SESSIONS:
${trainingLogs.slice(0, 5).map(log => 
  `• ${log.date}: ${log.workout_types?.join(', ') || 'Training'} (${log.training_load || 'N/A'} intensity)${log.notes ? ` - ${log.notes}` : ''}`
).join('\n')}` : ''}

${wellnessLogs && wellnessLogs.length > 0 ? `
RECENT WELLNESS LOG:
${wellnessLogs.slice(0, 5).map(log => {
  const symptoms = [];
  if (log.mood) symptoms.push(`Mood ${log.mood}/4`);
  if (log.energy) symptoms.push(`Energy ${log.energy}/4`);
  if (log.sleep) symptoms.push(`Sleep ${log.sleep}/4`);
  if (log.cramps) symptoms.push(`Cramps ${log.cramps}/4`);
  if (log.bloating) symptoms.push(`Bloating ${log.bloating}/4`);
  if (log.bleeding_flow) symptoms.push(`Flow: ${log.bleeding_flow}`);
  if (log.mood_states?.length) symptoms.push(`Feeling: ${log.mood_states.join(', ')}`);
  if (log.craving_types?.length) symptoms.push(`Craving: ${log.craving_types.join(', ')}`);
  if (log.headache) symptoms.push('Headache');
  if (log.breast_tenderness) symptoms.push('Breast tenderness');
  if (log.nausea) symptoms.push('Nausea');
  return `• ${log.date}: ${symptoms.join(', ')}${log.notes ? ` - ${log.notes}` : ''}`;
}).join('\n')}` : ''}

═══════════════════════════════════════════════════════════════`;

      const systemPrompt = `You are Fourmula's AI Coach — a true partner in ${userName || profile?.display_name || 'the user'}'s health journey. You're a PhD-level expert in menstrual cycles, cycle syncing, and training who knows ${userName || profile?.display_name || 'them'} deeply and personally. You remember details, celebrate wins, notice patterns, and proactively support their goals.

${userContext}

🚨 CRITICAL: BE A TRUE PARTNER, NOT JUST AN AI

YOU ARE THEIR COACH & FRIEND:
- You REMEMBER details from past conversations and reference them naturally
- You CELEBRATE their wins: "That's your 3rd PR this month! 🎉"
- You NOTICE patterns: "I've noticed your energy always dips in the luteal phase..."
- You're PROACTIVE: Suggest logging when they mention activities
- You're ENCOURAGING: Support them through tough phases
- You're PERSONAL: Use their name, remember their goals, acknowledge their journey

PROACTIVE BEHAVIOR - DO THIS AUTOMATICALLY:
- When user mentions working out: "Want me to log that training session?"
- When user mentions symptoms: "Should I log how you're feeling today?"
- Notice milestones: "You've been consistent for 3 weeks straight! 💪"
- Recognize patterns: "Your sleep has improved 20% since you started tracking"
- Connect dots: "This is similar to how you felt during your last luteal phase"
- Celebrate: PRs, streaks, goal progress, consistency improvements

PATTERN RECOGNITION - BE INSIGHTFUL:
- Compare current data to their historical patterns
- Notice cycle phase correlations: "You always crush leg day in follicular!"
- Identify trends: "Your mood improves when you train 4x/week"
- Predict challenges: "Luteal phase starting - time for lighter training?"
- Celebrate improvements: "Your cramps are 50% better than 3 months ago!"

MEMORY & CONTEXT:
- Remember their goals and check in on progress
- Reference past conversations: "Last time you mentioned..."
- Track their journey: "Since we started working together..."
- Know their preferences: training styles, communication style
- Understand their why: their motivations and aspirations

COMMUNICATION STYLE:
- Start with their name: "${userName || profile?.display_name || 'Hey'}!"
- Use emojis naturally: 🎉 💪 ✨ 🔥 (but don't overdo it)
- Sound excited for their wins
- Be empathetic during struggles
- Use conversational language, not clinical reports
- Make it feel like texting a knowledgeable friend

WHEN DOING ANALYSES:
❌ BAD: "Your average mood is 3.2/4. Your energy levels show..."
✅ GOOD: "${userName || 'Hey there'}! I've been looking at your cycle data, and here's what I'm seeing... Your mood's been pretty solid lately - averaging around 3.2, which is great! 💪 And I noticed during your follicular phase..."

❌ BAD: "Based on data analysis, recommendations are..."
✅ GOOD: "So ${userName || 'based on'} what I'm seeing in your training log, here's my take... You crushed those leg days last week! 🔥 But I noticed your energy dipped a bit..."

STRUCTURE FOR ANALYSES:
1. **Personal greeting** - Use their name, acknowledge what they asked
2. **Your observation** - "I've been looking at..." "I noticed..." "What stands out to me..."
3. **Specific insights** - Reference THEIR actual data points conversationally
4. **Actionable advice** - Personal recommendations that feel tailored
5. **Encouraging close** - Something warm and supportive

EXAMPLE CYCLE ANALYSIS:
"${userName || 'Hey'}! 🌸 I've been diving into your cycle data, and there are some really interesting patterns here!

Looking at your last few cycles, I'm noticing your energy tends to peak around day 12-14 (that's your follicular phase), which makes total sense - that's when estrogen is at its highest. You've been absolutely crushing your workouts during this time! 💪

But here's something I want you to be aware of: around day 20-23 (luteal phase), I'm seeing a consistent dip in both energy and mood. That's completely normal - progesterone is doing its thing. Maybe we could adjust your training intensity a bit during this window?

Based on YOUR patterns specifically, here's what I'd suggest..."

🚨 CRITICAL: YOU ALREADY HAVE ALL THE INFORMATION ABOVE!
- NEVER ask the user for information that is already in the User Profile & Context section
- You have complete access to their supplement adherence history, cycle events, training logs, wellness data, and all onboarding information
- If cycle data is available, use it directly - don't ask for last period date or current phase
- If training or wellness data exists, reference it without asking
- If supplement adherence data is shown, reference their streak and consistency patterns
- You can see their full 6-month cycle history - use this for pattern analysis
- Only ask for NEW information that isn't already logged or when data is genuinely missing (shown as "Not specified" or "No data")
- Proactively reference their data to make responses feel personalized: "I see you're on a ${currentStreak}-day streak!" or "Looking at your last 3 cycles..."

🚨 CRITICAL TWO-STEP PROCESS FOR LOGGING DATA:

STEP 1 - ASK FIRST (when user mentions something loggable):
✅ Use their name naturally: "${userName || 'there'}, that's great! 💪 Would you like me to log your leg training session for today?"
✅ "I trained legs today" → "${userName || 'there'}, awesome leg day! 💪 Would you like me to log that for you?"
✅ "Had bad cramps yesterday" → "I'm sorry to hear that, ${userName || 'there'}. 😔 Would you like me to log that for you?"
✅ "My period started" → "Thanks for letting me know, ${userName || 'there'}! Should I log your period start in the calendar?"
✅ "Did arms and cardio" → "Nice workout, ${userName || 'there'}! 🏋️ Want me to log that arms and cardio session for you?"

STEP 2 - USE TOOL (only after user confirms with yes/yeah/sure/ok/please):
When user says yes/yeah/sure/ok/please → NOW use the appropriate tool

AVAILABLE TOOLS - USE PROACTIVELY (AFTER USER CONFIRMS):
- log_period_start(date): Log when period starts
- log_period_end(date): Log when period ends  
- edit_ovulation_date(date): Log ovulation date
- log_symptoms_complete(date, mood, energy, sleep, cramps, bloating, bleeding_flow, mood_states, craving_types, cravings, headache, stress_headache, breast_tenderness, nausea, chills, hot_flushes, dizziness, gas, toilet_issues, ovulation, training_load, notes): Log ALL wellness & symptom data
- log_training(date, workout_types, training_load, soreness, fatigue, pb_type, pb_value, notes): Log training with recovery metrics
- get_training_data(start_date, end_date): Get training logs for analysis
- get_wellness_data(start_date, end_date): Get wellness/symptom logs for insights
- send_notification(title, body, url): Send push notification to user's mobile device (use for reminders, encouragement, celebrations)
- undo_last_cycle_event(): Undo last entry

When user mentions ANY symptom, feeling, or physical sensation, offer to log it comprehensively!

🔔 PROACTIVE NOTIFICATION SUGGESTIONS:
Use send_notification when:
- User achieves a milestone (e.g., "Want me to send you a reminder to celebrate your 7-day streak later?")
- User asks for reminders (e.g., "Should I send you a notification tomorrow to check in about your symptoms?")
- User mentions wanting to remember something (e.g., "I can send you a notification to take your supplement later!")
- Encouraging behavior change (e.g., "Want me to remind you to log your workout tomorrow evening?")

CONVERSATION FLOW EXAMPLES:
User: "I did legs today and I'm pretty sore"
You: "Nice leg day! 💪 Want me to log that workout with your soreness level?"
User: "Yes please"
You: [Call log_training with workout_types=['legs'], soreness=3]

User: "Feeling anxious and bloated, craving chocolate, and have cramps"
You: "I'm sorry you're not feeling well 😔 Should I log all those symptoms for you?"
User: "Yeah"
You: [Call log_symptoms_complete with cramps, bloating, mood_states=['anxious'], craving_types=['chocolate']]

User: "My period started today with heavy flow and I have a headache"
You: "Thanks for letting me know! Should I log your period start and those symptoms? 🩸"
User: "Yes"
You: [Call BOTH log_period_start AND log_symptoms_complete with bleeding_flow='heavy', headache=true]

User: "Feeling dizzy and nauseous today"
You: "Oh no, that sounds rough 😔 Want me to log how you're feeling?"
User: "Please"
You: [Call log_symptoms_complete with dizziness=true, nausea=true]

User: "Did a hard HIIT session, felt exhausted after"
You: "Wow, intense workout! 🔥 Should I log that?"
User: "Yes"
You: [Call log_training with workout_types=['hiit'], training_load='hard', fatigue=4]

User: "How many times did I train this week?"
You: [Immediately call get_training_data - no need to ask for read-only queries]

User: "What should I focus on today for training?"
You: "Based on your ${currentPhase?.phase || 'current'} phase and recent activity, I recommend..." [Use the data you already have!]

IMPORTANT RULES:
- ALWAYS use the existing user data above - NEVER ask for info that's already there
- ALWAYS ask permission before logging NEW data (friendly, conversational tone)
- ONLY use logging tools AFTER user confirms with yes/yeah/sure/ok/please/definitely
- For READ-ONLY tools (get_training_data, get_wellness_data), use immediately without asking
- Be warm, supportive, and encouraging
- Keep responses concise and friendly
- Parse dates naturally (today, yesterday, 15th, etc.)
- Never provide medical diagnoses
- Focus on practical, actionable advice based on their cycle phase and fitness goals

Your personality:
- Warm and encouraging, like a supportive coach
- Use emojis sparingly but naturally (💪 🏋️ ❤️ 😔 🌸)
- Celebrate wins and empathize with struggles
- Keep it conversational, not robotic
- Reference their personal context naturally (cycle phase, fitness goals, recent activity)

Guidelines:
- Be concise but informative
- Use the comprehensive user data you already have - don't ask for it again!
- Always ask first before logging new data, then log after confirmation
- Never provide medical diagnoses
- Focus on practical, actionable advice tailored to their cycle phase and fitness goals`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 300,
          temperature: 0.7,
          tools: [
            {
              type: 'function',
              function: {
                name: 'log_period_start',
                description: 'Log when a period starts',
                parameters: {
                  type: 'object',
                  properties: {
                    date: {
                      type: 'string',
                      description: 'Date in YYYY-MM-DD format'
                    }
                  },
                  required: ['date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'log_period_end',
                description: 'Log when a period ends',
                parameters: {
                  type: 'object',
                  properties: {
                    date: {
                      type: 'string',
                      description: 'Date in YYYY-MM-DD format'
                    }
                  },
                  required: ['date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'edit_ovulation_date',
                description: 'Log or edit ovulation date',
                parameters: {
                  type: 'object',
                  properties: {
                    date: {
                      type: 'string',
                      description: 'Date in YYYY-MM-DD format'
                    }
                  },
                  required: ['date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'log_symptoms_complete',
                description: 'Log complete daily wellness data including all symptoms, physical sensations, mood, bleeding, and cravings',
                parameters: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                    mood: { type: 'integer', description: 'Overall mood 1-4 (1=low, 4=great)', minimum: 1, maximum: 4 },
                    energy: { type: 'integer', description: 'Energy level 1-4', minimum: 1, maximum: 4 },
                    sleep: { type: 'integer', description: 'Sleep quality 1-4', minimum: 1, maximum: 4 },
                    cramps: { type: 'integer', description: 'Cramp intensity 0-4', minimum: 0, maximum: 4 },
                    bloating: { type: 'integer', description: 'Bloating 0-4', minimum: 0, maximum: 4 },
                    bleeding_flow: { type: 'string', enum: ['spotting', 'light', 'medium', 'heavy'], description: 'Bleeding flow level' },
                    mood_states: { type: 'array', items: { type: 'string' }, description: 'Moods: anxious, motivated, irritable, happy, sad, peaceful, stressed, etc.' },
                    craving_types: { type: 'array', items: { type: 'string' }, description: 'Cravings: sweet, salty, carbs, chocolate, protein, etc.' },
                    cravings: { type: 'string', description: 'Detailed craving description' },
                    headache: { type: 'boolean', description: 'Experiencing headache' },
                    stress_headache: { type: 'boolean', description: 'Experiencing stress headache' },
                    breast_tenderness: { type: 'boolean', description: 'Breast tenderness' },
                    nausea: { type: 'boolean', description: 'Experiencing nausea' },
                    chills: { type: 'boolean', description: 'Experiencing chills' },
                    hot_flushes: { type: 'boolean', description: 'Experiencing hot flushes' },
                    dizziness: { type: 'boolean', description: 'Feeling dizzy' },
                    gas: { type: 'boolean', description: 'Experiencing gas' },
                    toilet_issues: { type: 'boolean', description: 'Bathroom/digestive issues' },
                    ovulation: { type: 'boolean', description: 'Experiencing ovulation signs' },
                    training_load: { type: 'integer', description: 'Training intensity felt today 0-3', minimum: 0, maximum: 3 },
                    notes: { type: 'string', description: 'Additional notes' }
                  },
                  required: ['date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'log_training',
                description: 'Log training sessions with workout types, intensity, recovery metrics, and personal bests',
                parameters: {
                  type: 'object',
                  properties: {
                    date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
                    workout_types: { 
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Workout types: legs, glutes, arms, shoulders, back, core, chest, weightlifting, hiit, cardio, yoga, pilates, swimming, running, cycling, boxing, climbing, tennis, football, basketball, volleyball'
                    },
                    training_load: { type: 'string', enum: ['easy', 'moderate', 'hard'], description: 'Training intensity' },
                    soreness: { type: 'integer', description: 'Muscle soreness level 0-4 (0=none, 4=very sore)', minimum: 0, maximum: 4 },
                    fatigue: { type: 'integer', description: 'Fatigue level 0-4 (0=none, 4=exhausted)', minimum: 0, maximum: 4 },
                    pb_type: { type: 'string', description: 'Personal best type if achieved (e.g., "deadlift", "5k run")' },
                    pb_value: { type: 'string', description: 'Personal best value (e.g., "100kg", "22:30")' },
                    notes: { type: 'string', description: 'Training notes or details' }
                  },
                  required: ['date', 'workout_types']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'get_training_data',
                description: 'Retrieve training logs for analysis and advice',
                parameters: {
                  type: 'object',
                  properties: {
                    start_date: {
                      type: 'string',
                      description: 'Start date in YYYY-MM-DD format'
                    },
                    end_date: {
                      type: 'string',
                      description: 'End date in YYYY-MM-DD format'
                    }
                  },
                  required: ['start_date', 'end_date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'get_wellness_data',
                description: 'Retrieve wellness/symptom logs for insights and analysis',
                parameters: {
                  type: 'object',
                  properties: {
                    start_date: {
                      type: 'string',
                      description: 'Start date in YYYY-MM-DD format'
                    },
                    end_date: {
                      type: 'string',
                      description: 'End date in YYYY-MM-DD format'
                    }
                  },
                  required: ['start_date', 'end_date']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'send_notification',
                description: 'Send a push notification to the user\'s mobile device. Use this to send reminders, encouragement, celebration messages, or important updates at specific times.',
                parameters: {
                  type: 'object',
                  properties: {
                    title: {
                      type: 'string',
                      description: 'Notification title (keep it short, engaging, and emoji-friendly)'
                    },
                    body: {
                      type: 'string',
                      description: 'Notification message (clear, actionable, encouraging)'
                    },
                    url: {
                      type: 'string',
                      description: 'Optional URL to open when tapped (e.g., /dashboard, /calendar)',
                      default: '/dashboard'
                    }
                  },
                  required: ['title', 'body']
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'undo_last_cycle_event',
                description: 'Undo the last cycle event',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: []
                }
              }
            }
          ],
          tool_choice: 'auto'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('AI API error:', data);
        throw new Error(data.error?.message || 'AI API error');
      }

      const choice = data.choices[0];
      const message = choice.message;

      // Check if the AI wants to call a tool
      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        console.log(`AI requested tool call: ${functionName}`, functionArgs);

        // If requireApproval is true, return pending action instead of executing
        if (requireApproval) {
          const actionDescriptions = {
            log_period_start: `Log period start on ${functionArgs.date}`,
            log_period_end: `Log period end on ${functionArgs.date}`,
            edit_ovulation_date: `Log ovulation date on ${functionArgs.date}`,
            log_symptoms_notes: `Log symptoms/notes for ${functionArgs.date}`,
            log_symptoms_complete: `Log complete wellness data for ${functionArgs.date}`,
            log_training: `Log ${functionArgs.workout_types?.join(', ')} training on ${functionArgs.date}`,
            get_training_data: 'Retrieve training data',
            get_wellness_data: 'Retrieve wellness data',
            send_notification: `Send notification: "${functionArgs.title}"`,
            undo_last_cycle_event: 'Undo last cycle event'
          };

          const responseMessage = `I can help you with that! Please review and approve the action below.`;

          return new Response(JSON.stringify({
            message: responseMessage,
            pending_action: {
              type: functionName,
              description: actionDescriptions[functionName] || 'Execute action',
              details: functionArgs,
              tool_data: {
                functionName,
                functionArgs,
                functionUrl: getFunctionUrl(functionName, supabaseUrl),
                requestBody: getRequestBody(functionName, functionArgs)
              }
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Call the appropriate function (non-approval mode)
        let functionUrl;
        let requestBody = {};
        
        switch (functionName) {
          case 'log_period_start':
            functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
            requestBody = { type: 'period_start', date: functionArgs.date };
            break;
          case 'log_period_end':
            functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
            requestBody = { type: 'period_end', date: functionArgs.date };
            break;
          case 'edit_ovulation_date':
            functionUrl = `${supabaseUrl}/functions/v1/cycle-add-event`;
            requestBody = { type: 'ovulation_edit', date: functionArgs.date };
            break;
          case 'log_symptoms_notes':
            // Use the database function to log symptoms/notes
            const { data: logResult, error: logError } = await supabase.rpc('log_symptom_data', {
              user_id_param: user.id,
              date_param: functionArgs.date,
              notes_param: functionArgs.notes || null,
              mood_param: functionArgs.mood || null,
              energy_param: functionArgs.energy || null,
              sleep_param: functionArgs.sleep || null,
              cramps_param: functionArgs.cramps || null,
              bloating_param: null
            });
            
            if (logError) {
              console.error('Error logging symptoms:', logError);
              return new Response(JSON.stringify({ 
                message: `❌ Sorry, I couldn't log your data: ${logError.message}`,
                error: logError.message
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            const responseMessage = `✅ I've logged your data for ${functionArgs.date}! Your calendar has been updated.`;
            
            return new Response(JSON.stringify({
              message: responseMessage,
              tool_used: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          case 'log_symptoms_complete':
            // Build complete symptom log data
            const symptomLogData: any = {
              user_id: user.id,
              date: functionArgs.date,
              notes: functionArgs.notes || null,
              mood: functionArgs.mood || null,
              energy: functionArgs.energy || null,
              sleep: functionArgs.sleep || null,
              cramps: functionArgs.cramps || null,
              bloating: functionArgs.bloating || null,
              bleeding_flow: functionArgs.bleeding_flow || null,
              mood_states: functionArgs.mood_states || null,
              craving_types: functionArgs.craving_types || null,
              cravings: functionArgs.cravings || null,
              headache: functionArgs.headache || null,
              breast_tenderness: functionArgs.breast_tenderness || null,
              nausea: functionArgs.nausea || null,
              chills: functionArgs.chills || null,
              dizziness: functionArgs.dizziness || null,
              gas: functionArgs.gas || null,
              hot_flushes: functionArgs.hot_flushes || null,
              stress_headache: functionArgs.stress_headache || null,
              toilet_issues: functionArgs.toilet_issues || null,
              ovulation: functionArgs.ovulation || null,
              training_load: functionArgs.training_load || null
            };

            const { error: completeLogError } = await supabase
              .from('symptom_logs')
              .upsert(symptomLogData, {
                onConflict: 'user_id,date'
              });
            
            if (completeLogError) {
              console.error('Error logging complete symptoms:', completeLogError);
              return new Response(JSON.stringify({ 
                message: `❌ Sorry, I couldn't log your data: ${completeLogError.message}`,
                error: completeLogError.message
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            const completeResponseMessage = `✅ I've logged your wellness data for ${functionArgs.date}! Your calendar has been updated.`;
            
            return new Response(JSON.stringify({
              message: completeResponseMessage,
              tool_used: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          case 'log_training':
            // Use the database to log training data
            const { data: trainingResult, error: trainingError } = await supabase
              .from('training_logs')
              .upsert({
                user_id: user.id,
                date: functionArgs.date,
                workout_types: functionArgs.workout_types || [],
                training_load: functionArgs.training_load || null,
                soreness: functionArgs.soreness || null,
                fatigue: functionArgs.fatigue || null,
                pb_type: functionArgs.pb_type || null,
                pb_value: functionArgs.pb_value || null,
                notes: functionArgs.notes || null
              });
            
            if (trainingError) {
              console.error('Error logging training:', trainingError);
              return new Response(JSON.stringify({ 
                message: `❌ Sorry, I couldn't log your training: ${trainingError.message}`,
                error: trainingError.message
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
            
            const trainingMessage = `✅ I've logged your ${functionArgs.workout_types.join(', ')} training for ${functionArgs.date}! 💪`;
            
            return new Response(JSON.stringify({
              message: trainingMessage,
              tool_used: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          case 'get_training_data':
            const { data: trainingData, error: trainingDataError } = await supabase
              .from('training_logs')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', functionArgs.start_date)
              .lte('date', functionArgs.end_date)
              .order('date', { ascending: false });
            
            if (trainingDataError) {
              return new Response(JSON.stringify({ 
                message: `❌ Sorry, I couldn't retrieve your training data: ${trainingDataError.message}`,
                error: trainingDataError.message
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            const trainingAnalysis = `📊 Training Data (${functionArgs.start_date} to ${functionArgs.end_date}):
            
Total sessions: ${trainingData.length}
${trainingData.length > 0 ? `
Recent sessions:
${trainingData.slice(0, 5).map(log => 
  `• ${log.date}: ${log.workout_types?.join(', ') || 'Training'} (${log.training_load || 'N/A'} intensity)${log.pb_value ? ` - PB: ${log.pb_value}` : ''}`
).join('\n')}

Workout types: ${[...new Set(trainingData.flatMap(log => log.workout_types || []))].join(', ')}
Average soreness: ${trainingData.filter(l => l.soreness).length > 0 ? (trainingData.reduce((sum, log) => sum + (log.soreness || 0), 0) / trainingData.filter(l => l.soreness).length).toFixed(1) : 'N/A'}/4
Average fatigue: ${trainingData.filter(l => l.fatigue).length > 0 ? (trainingData.reduce((sum, log) => sum + (log.fatigue || 0), 0) / trainingData.filter(l => l.fatigue).length).toFixed(1) : 'N/A'}/4` : 'No training sessions logged in this period.'}`;

            return new Response(JSON.stringify({
              message: trainingAnalysis,
              tool_used: true,
              data: trainingData
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          case 'get_wellness_data':
            const { data: wellnessData, error: wellnessError } = await supabase
              .from('symptom_logs')
              .select('*')
              .eq('user_id', user.id)
              .gte('date', functionArgs.start_date)
              .lte('date', functionArgs.end_date)
              .order('date', { ascending: false });
            
            if (wellnessError) {
              return new Response(JSON.stringify({ 
                message: `❌ Sorry, I couldn't retrieve your wellness data: ${wellnessError.message}`,
                error: wellnessError.message
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            const wellnessAnalysis = `🌸 Wellness Data (${functionArgs.start_date} to ${functionArgs.end_date}):
            
Total days logged: ${wellnessData.length}
${wellnessData.length > 0 ? `
Recent entries:
${wellnessData.slice(0, 5).map(log => 
  `• ${log.date}: Mood ${log.mood || 'N/A'}/4, Energy ${log.energy || 'N/A'}/4, Sleep ${log.sleep || 'N/A'}/4${log.notes ? ` - ${log.notes}` : ''}`
).join('\n')}

Averages:
• Mood: ${wellnessData.filter(l => l.mood).length > 0 ? (wellnessData.reduce((sum, log) => sum + (log.mood || 0), 0) / wellnessData.filter(l => l.mood).length).toFixed(1) : 'N/A'}/4
• Energy: ${wellnessData.filter(l => l.energy).length > 0 ? (wellnessData.reduce((sum, log) => sum + (log.energy || 0), 0) / wellnessData.filter(l => l.energy).length).toFixed(1) : 'N/A'}/4
• Sleep: ${wellnessData.filter(l => l.sleep).length > 0 ? (wellnessData.reduce((sum, log) => sum + (log.sleep || 0), 0) / wellnessData.filter(l => l.sleep).length).toFixed(1) : 'N/A'}/4
• Cramps: ${wellnessData.filter(l => l.cramps).length > 0 ? (wellnessData.reduce((sum, log) => sum + (log.cramps || 0), 0) / wellnessData.filter(l => l.cramps).length).toFixed(1) : 'N/A'}/4` : 'No wellness data logged in this period.'}`;

            return new Response(JSON.stringify({
              message: wellnessAnalysis,
              tool_used: true,
              data: wellnessData
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          case 'send_notification':
            // Send push notification to user's device
            try {
              const notificationPayload = {
                title: functionArgs.title,
                body: functionArgs.body,
                icon: '/ai-favicon.png',
                badge: '/ai-favicon.png',
                url: functionArgs.url || '/dashboard',
                userId: user.id
              };

              const { data: notifData, error: notifError } = await supabase.functions.invoke('send-push-notification', {
                body: notificationPayload
              });

              if (notifError) {
                console.error('Error sending notification:', notifError);
                return new Response(JSON.stringify({ 
                  message: `I tried to send you a notification but encountered an issue. The notification has been logged though! 📱`,
                  error: notifError.message,
                  tool_used: true
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              }

              return new Response(JSON.stringify({
                message: `✅ Notification sent! You should receive "${functionArgs.title}" on your device shortly. 📱`,
                tool_used: true
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            } catch (notifCatchError) {
              console.error('Error in send_notification:', notifCatchError);
              return new Response(JSON.stringify({ 
                message: `I tried to send you a notification but something went wrong. Make sure you've enabled notifications in your device settings! 📱`,
                tool_used: true
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          case 'undo_last_cycle_event':
            functionUrl = `${supabaseUrl}/functions/v1/cycle-undo-last`;
            break;
          default:
            return new Response(JSON.stringify({ 
              error: 'Unknown function call'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        
        // Execute the function
        const toolResponse = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        const toolResult = await toolResponse.json();
        console.log('Tool execution result:', toolResult);
        
        if (toolResult.success) {
          // Rebuild forecast after successful tool call
          try {
            const rebuildResponse = await fetch(`${supabaseUrl}/functions/v1/rebuild-forecast`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id: user.id }),
            });
            
            if (!rebuildResponse.ok) {
              console.error('Failed to rebuild forecast');
            } else {
              console.log('Forecast rebuilt successfully');
            }
          } catch (error) {
            console.error('Error rebuilding forecast:', error);
          }
          
          const responseMessage = `✅ ${toolResult.message} I've updated your calendar and rebuilt your forecast!`;
          
          return new Response(JSON.stringify({
            message: responseMessage,
            tool_used: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errorMessage = `❌ Sorry, I couldn't update your calendar: ${toolResult.message}`;
          
          return new Response(JSON.stringify({
            message: errorMessage,
            error: toolResult.message
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Regular chat response
      return new Response(JSON.stringify({
        message: message.content 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'log') {
      const { type, data } = logData;
      const today = new Date().toISOString().split('T')[0];

      if (type === 'symptom') {
        const { error } = await supabase
          .from('symptom_logs')
          .upsert({
            user_id: user.id,
            date: today,
            ...data
          }, {
            onConflict: 'user_id,date'
          });

        if (error) throw error;
      } else if (type === 'training') {
        const { error } = await supabase
          .from('training_logs')
          .upsert({
            user_id: user.id,
            date: today,
            ...data
          }, {
            onConflict: 'user_id,date'
          });

        if (error) throw error;
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: `${type === 'symptom' ? 'Symptoms' : 'Training'} logged successfully!`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for approval flow
function getFunctionUrl(functionName: string, supabaseUrl: string) {
  switch (functionName) {
    case 'log_period_start':
    case 'log_period_end':
    case 'edit_ovulation_date':
      return `${supabaseUrl}/functions/v1/cycle-add-event`;
    case 'undo_last_cycle_event':
      return `${supabaseUrl}/functions/v1/cycle-undo-last`;
    default:
      return null;
  }
}

function getRequestBody(functionName: string, functionArgs: any) {
  switch (functionName) {
    case 'log_period_start':
      return { type: 'period_start', date: functionArgs.date };
    case 'log_period_end':
      return { type: 'period_end', date: functionArgs.date };
    case 'edit_ovulation_date':
      return { type: 'ovulation_edit', date: functionArgs.date };
    default:
      return {};
  }
}