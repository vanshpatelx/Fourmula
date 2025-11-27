-- Create trigger to automatically create user profiles when new users sign up
-- This ensures forecasts can be generated properly

-- First check if trigger already exists and drop it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to auto-create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Also manually invoke the rebuild-forecast function for the current user
-- to generate their phase forecasts now
SELECT net.http_post(
  url := 'https://wscbqaowafweppryqyrs.supabase.co/functions/v1/rebuild-forecast',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}',
  body := '{"user_id": "4cd559bf-bcf6-4a68-be65-525ca9916381"}'
) as forecast_generation_result;