-- Update check constraints for cramps and bloating to allow 0-4 scale

-- Drop old constraints
ALTER TABLE symptom_logs DROP CONSTRAINT symptom_logs_cramps_check;
ALTER TABLE symptom_logs DROP CONSTRAINT symptom_logs_bloating_check;

-- Add new constraints with 0-4 range
ALTER TABLE symptom_logs ADD CONSTRAINT symptom_logs_cramps_check 
  CHECK (cramps >= 0 AND cramps <= 4);

ALTER TABLE symptom_logs ADD CONSTRAINT symptom_logs_bloating_check 
  CHECK (bloating >= 0 AND bloating <= 4);