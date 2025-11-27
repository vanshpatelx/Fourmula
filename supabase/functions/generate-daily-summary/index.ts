import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id");

    if (profilesError) throw profilesError;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split("T")[0];

    // Process each user
    for (const profile of profiles || []) {
      try {
        // Get yesterday's messages for this user
        const { data: messages, error: messagesError } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", profile.user_id)
          .gte("timestamp", `${yesterdayDate}T00:00:00`)
          .lt("timestamp", `${yesterdayDate}T23:59:59`)
          .order("timestamp", { ascending: true });

        if (messagesError) throw messagesError;

        if (!messages || messages.length === 0) {
          console.log(`No messages for user ${profile.user_id} on ${yesterdayDate}`);
          continue;
        }

        // Create conversation text for AI
        const conversationText = messages
          .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
          .join("\n\n");

        // Generate summary using AI
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are an AI assistant that creates concise daily summaries of conversations. Create a brief, friendly summary (2-3 sentences) of what the user and AI discussed, highlighting key topics, questions answered, or actions taken. Keep it conversational and personal.",
              },
              {
                role: "user",
                content: `Summarize this conversation from ${yesterdayDate}:\n\n${conversationText}`,
              },
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for user ${profile.user_id}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const summary = aiData.choices[0].message.content;

        // Save summary to database
        const { error: insertError } = await supabase.from("chat_summaries").insert({
          user_id: profile.user_id,
          date: yesterdayDate,
          summary: summary,
          message_count: messages.length,
        });

        if (insertError) {
          console.error(`Error saving summary for user ${profile.user_id}:`, insertError);
          continue;
        }

        // Delete yesterday's chat messages
        const { error: deleteError } = await supabase
          .from("chat_conversations")
          .delete()
          .eq("user_id", profile.user_id)
          .gte("timestamp", `${yesterdayDate}T00:00:00`)
          .lt("timestamp", `${yesterdayDate}T23:59:59`);

        if (deleteError) {
          console.error(`Error deleting messages for user ${profile.user_id}:`, deleteError);
        }

        console.log(`Successfully processed summary for user ${profile.user_id}`);
      } catch (userError) {
        console.error(`Error processing user ${profile.user_id}:`, userError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Daily summaries generated successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-daily-summary function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
