-- Update reminder_plans table to support phase-based reminders
ALTER TABLE reminder_plans 
ADD COLUMN phase_a_time time without time zone,
ADD COLUMN phase_b_time time without time zone,
ADD COLUMN reminders_enabled boolean DEFAULT true,
ADD COLUMN phase_a_training_days_only boolean DEFAULT true;

-- Migrate existing data - move time_local to phase_b_time
UPDATE reminder_plans 
SET phase_b_time = time_local,
    reminders_enabled = true
WHERE phase_b_time IS NULL;

-- Make time_local nullable since we now use phase-specific times
ALTER TABLE reminder_plans ALTER COLUMN time_local DROP NOT NULL;

-- Update profiles table with comprehensive onboarding fields
ALTER TABLE profiles
ADD COLUMN country TEXT,
ADD COLUMN timezone TEXT DEFAULT 'Europe/London',
ADD COLUMN height_cm NUMERIC,
ADD COLUMN weight_kg NUMERIC,
ADD COLUMN cycle_regularity TEXT CHECK (cycle_regularity IN ('regular', 'irregular', 'not_sure')),
ADD COLUMN trying_to_conceive BOOLEAN DEFAULT false,
ADD COLUMN pregnancy_status TEXT CHECK (pregnancy_status IN ('no', 'pregnant', 'postpartum')),
ADD COLUMN training_styles TEXT[],
ADD COLUMN weekly_training_goal INTEGER,
ADD COLUMN session_length TEXT,
ADD COLUMN fitness_goals TEXT[],
ADD COLUMN sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'ok', 'good')),
ADD COLUMN stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),
ADD COLUMN common_pms_symptoms TEXT[],
ADD COLUMN known_conditions TEXT[];

-- Add comment explaining the schema
COMMENT ON COLUMN reminder_plans.phase_a_time IS 'Morning reminder time for Phase A (Follicular + Ovulatory) supplements - taken on training days only';
COMMENT ON COLUMN reminder_plans.phase_b_time IS 'Evening reminder time for Phase B (Luteal + Menstrual) supplements - taken before bed';
COMMENT ON COLUMN reminder_plans.phase_a_training_days_only IS 'If true, Phase A reminders only appear on days user logs training';
COMMENT ON COLUMN profiles.cycle_regularity IS 'User-reported cycle regularity: regular, irregular, or not_sure';
COMMENT ON COLUMN profiles.pregnancy_status IS 'Current pregnancy status: no, pregnant, or postpartum';
COMMENT ON COLUMN profiles.training_styles IS 'Array of training styles: strength, cardio, mixed, yoga_pilates, team_sport, other';
COMMENT ON COLUMN profiles.fitness_goals IS 'Array of fitness goals selected during onboarding';