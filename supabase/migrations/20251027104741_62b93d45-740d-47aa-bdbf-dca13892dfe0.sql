-- Fix training_logs check constraints to match UI (1-5 range instead of 0-3)
ALTER TABLE training_logs 
DROP CONSTRAINT IF EXISTS training_logs_fatigue_check;

ALTER TABLE training_logs 
DROP CONSTRAINT IF EXISTS training_logs_soreness_check;

-- Add new constraints with correct ranges (1-5)
ALTER TABLE training_logs 
ADD CONSTRAINT training_logs_fatigue_check CHECK (fatigue >= 1 AND fatigue <= 5);

ALTER TABLE training_logs 
ADD CONSTRAINT training_logs_soreness_check CHECK (soreness >= 1 AND soreness <= 5);