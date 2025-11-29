-- Allow 0..4 for cramps and bloating to match UI (None=0 .. Extreme=4)
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_cramps_check;
ALTER TABLE public.symptom_logs DROP CONSTRAINT IF EXISTS symptom_logs_bloating_check;

ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_cramps_check CHECK (cramps BETWEEN 0 AND 4);
ALTER TABLE public.symptom_logs ADD CONSTRAINT symptom_logs_bloating_check CHECK (bloating BETWEEN 0 AND 4);
