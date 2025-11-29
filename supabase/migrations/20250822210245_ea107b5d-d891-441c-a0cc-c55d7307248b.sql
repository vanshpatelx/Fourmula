-- Fix check constraints for symptom_logs table to match UI expectations
-- All symptom fields should accept 0-5 range or similar appropriate ranges

-- Drop existing constraints that are causing issues
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_bloating_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_cramps_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_mood_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_energy_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_sleep_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_training_load_check;

-- Add correct constraints that match the UI
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_bloating_check CHECK (bloating >= 0 AND bloating <= 4);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_cramps_check CHECK (cramps >= 0 AND cramps <= 4);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_mood_check CHECK (mood >= 1 AND mood <= 5);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_energy_check CHECK (energy >= 1 AND energy <= 5);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_sleep_check CHECK (sleep >= 1 AND sleep <= 5);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_training_load_check CHECK (training_load >= 0 AND training_load <= 3);