-- Create training_logs table for daily training tracking
CREATE TABLE public.training_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    training_load TEXT CHECK (training_load IN ('rest','easy','moderate','hard')),
    soreness INTEGER CHECK (soreness >= 0 AND soreness <= 3),
    fatigue INTEGER CHECK (fatigue >= 0 AND fatigue <= 3),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.training_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_logs
CREATE POLICY "Users can view own training logs" 
ON public.training_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training logs" 
ON public.training_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training logs" 
ON public.training_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training logs" 
ON public.training_logs 
FOR DELETE 
USING (auth.uid() = user_id);