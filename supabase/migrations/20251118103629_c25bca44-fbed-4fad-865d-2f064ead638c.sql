-- Add metadata column to challenges table to support custom goals
ALTER TABLE public.challenges 
ADD COLUMN metadata jsonb DEFAULT NULL;

-- Add a comment to explain the column's purpose
COMMENT ON COLUMN public.challenges.metadata IS 'Stores custom goal information like title, description, and custom flags for user-created challenges';