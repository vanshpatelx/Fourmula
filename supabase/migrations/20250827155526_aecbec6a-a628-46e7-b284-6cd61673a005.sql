-- Update the channel check constraint to allow 'manual' value
ALTER TABLE public.reminder_events 
DROP CONSTRAINT reminder_events_channel_check;

ALTER TABLE public.reminder_events 
ADD CONSTRAINT reminder_events_channel_check 
CHECK (channel = ANY (ARRAY['push'::text, 'email'::text, 'sms'::text, 'manual'::text]));