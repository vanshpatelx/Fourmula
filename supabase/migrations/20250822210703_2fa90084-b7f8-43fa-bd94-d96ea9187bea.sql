-- Fix the cycle_events type constraint to allow 'period' as a valid value
-- The Calendar page is trying to insert 'period' but the constraint is blocking it

-- Drop the existing constraint
ALTER TABLE public.cycle_events DROP CONSTRAINT IF EXISTS cycle_events_type_check;

-- Add the correct constraint that includes 'period' and other valid cycle event types
ALTER TABLE public.cycle_events ADD CONSTRAINT cycle_events_type_check 
CHECK (type IN ('period', 'ovulation', 'spotting', 'period_start', 'period_end'));