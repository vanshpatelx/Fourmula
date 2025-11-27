-- Add new fields to training_logs table
ALTER TABLE public.training_logs 
ADD COLUMN workout_types text[],
ADD COLUMN pb_type text,
ADD COLUMN pb_value text;

-- Add new fields to symptom_logs table  
ALTER TABLE public.symptom_logs
ADD COLUMN headache boolean DEFAULT false,
ADD COLUMN breast_tenderness boolean DEFAULT false,
ADD COLUMN cravings text;