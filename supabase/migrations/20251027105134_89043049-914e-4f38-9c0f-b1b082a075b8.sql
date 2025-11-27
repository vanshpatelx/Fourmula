-- Update reminder_plans regimen constraint to match new Phase A/B system
ALTER TABLE reminder_plans 
DROP CONSTRAINT IF EXISTS reminder_plans_regimen_check;

-- Add new constraint with Phase A/B values
ALTER TABLE reminder_plans 
ADD CONSTRAINT reminder_plans_regimen_check 
CHECK (regimen IN ('daily', 'phase_a', 'phase_b', 'both'));