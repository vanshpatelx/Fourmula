-- Remove duplicate challenges, keeping only the most recent one for each type per user
DELETE FROM challenges a
USING challenges b
WHERE a.user_id = b.user_id 
  AND a.challenge_type = b.challenge_type 
  AND a.created_at < b.created_at;

-- Add unique constraint to prevent duplicate challenge types per user
ALTER TABLE challenges 
ADD CONSTRAINT unique_user_challenge_type UNIQUE (user_id, challenge_type);