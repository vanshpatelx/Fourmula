-- Add new columns for comprehensive symptom tracking
ALTER TABLE public.symptom_logs 
ADD COLUMN IF NOT EXISTS nausea boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gas boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS toilet_issues boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bleeding_flow text CHECK (bleeding_flow IN ('light', 'medium', 'heavy')),
ADD COLUMN IF NOT EXISTS ovulation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mood_states text[], -- Array for multiple mood states
ADD COLUMN IF NOT EXISTS hot_flushes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS chills boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stress_headache boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dizziness boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS craving_types text[]; -- Array for multiple craving types

-- Update the existing cravings column comment
COMMENT ON COLUMN public.symptom_logs.cravings IS 'Legacy text field for cravings - use craving_types array for new entries';