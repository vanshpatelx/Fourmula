-- Add training goal field to adherence_goals table
ALTER TABLE public.adherence_goals 
ADD COLUMN training_goal_days integer DEFAULT 3;