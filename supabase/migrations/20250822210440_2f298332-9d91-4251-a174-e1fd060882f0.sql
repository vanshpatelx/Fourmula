-- Add unique constraint to cycle_events table for upsert operations
-- This allows the ON CONFLICT clause in the Calendar page to work properly

ALTER TABLE public.cycle_events 
ADD CONSTRAINT cycle_events_user_date_unique 
UNIQUE (user_id, date);