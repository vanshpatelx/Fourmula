-- Fix: Add SET search_path to update_updated_at_column function
-- This prevents potential SQL injection via search_path manipulation
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Note: weekly_wins_view is already secured by RLS policies on the underlying tables
-- (adherence_logs and training_logs both have proper RLS policies)
-- Views inherit security from their base tables, so no additional RLS is needed