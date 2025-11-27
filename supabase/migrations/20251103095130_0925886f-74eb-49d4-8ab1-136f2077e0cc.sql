-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create cron job to trigger reminder scheduler every 5 minutes
SELECT cron.schedule(
  'supplement-reminder-scheduler',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://wscbqaowafweppryqyrs.supabase.co/functions/v1/schedule-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY2JxYW93YWZ3ZXBwcnlxeXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODYyODMsImV4cCI6MjA3MTQ2MjI4M30.OdEaf39yWEkwBPPKWYiOtRUFAgK_DoY0MPzZJ_gNdQE"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);