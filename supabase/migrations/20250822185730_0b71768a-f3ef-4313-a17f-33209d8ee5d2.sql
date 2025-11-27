-- Create user profile table
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  region text DEFAULT 'Europe/London',
  birth_year int,
  contraception_type text CHECK (contraception_type IN ('none', 'pill', 'iud', 'implant', 'injection', 'ring', 'patch', 'other')),
  cycle_irregular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create cycle baseline table
CREATE TABLE public.cycle_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  avg_cycle_len int NOT NULL CHECK (avg_cycle_len BETWEEN 15 AND 60),
  luteal_len int DEFAULT 14,
  last_period_start date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cycle events table
CREATE TABLE public.cycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('period_start','period_end','ovulation_edit')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create phase forecasts table
CREATE TABLE public.phase_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  phase text CHECK (phase IN ('menstrual','follicular','ovulatory','luteal')),
  confidence numeric CHECK (confidence BETWEEN 0 AND 1),
  UNIQUE(user_id, date)
);

-- Create reminder plans table
CREATE TABLE public.reminder_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  regimen text NOT NULL CHECK (regimen IN ('daily', 'luteal_only', 'luteal_menstrual', 'symptom_triggered', 'custom')),
  time_local time NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/London',
  quiet_hours_on boolean DEFAULT true,
  days_of_week int[] DEFAULT null,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reminder events table
CREATE TABLE public.reminder_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_for timestamptz NOT NULL,
  status text CHECK (status IN ('sent','taken','snoozed','skipped')) DEFAULT 'sent',
  channel text CHECK (channel IN ('push','email','sms')) DEFAULT 'push',
  created_at timestamptz DEFAULT now()
);

-- Create symptom logs table
CREATE TABLE public.symptom_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  mood int CHECK (mood BETWEEN 1 AND 5),
  energy int CHECK (energy BETWEEN 1 AND 5),
  cramps int CHECK (cramps BETWEEN 1 AND 5),
  bloating int CHECK (bloating BETWEEN 1 AND 5),
  sleep int CHECK (sleep BETWEEN 1 AND 5),
  training_load int CHECK (training_load BETWEEN 1 AND 5),
  notes text,
  UNIQUE(user_id, date)
);

-- Create notification subscriptions table
CREATE TABLE public.notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for cycle_baselines
CREATE POLICY "Users can view own cycle baselines" ON public.cycle_baselines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle baselines" ON public.cycle_baselines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle baselines" ON public.cycle_baselines
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for cycle_events
CREATE POLICY "Users can view own cycle events" ON public.cycle_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle events" ON public.cycle_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle events" ON public.cycle_events
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cycle events" ON public.cycle_events
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for phase_forecasts
CREATE POLICY "Users can view own phase forecasts" ON public.phase_forecasts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own phase forecasts" ON public.phase_forecasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own phase forecasts" ON public.phase_forecasts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for reminder_plans
CREATE POLICY "Users can view own reminder plans" ON public.reminder_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminder plans" ON public.reminder_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminder plans" ON public.reminder_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for reminder_events
CREATE POLICY "Users can view own reminder events" ON public.reminder_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminder events" ON public.reminder_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminder events" ON public.reminder_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for symptom_logs
CREATE POLICY "Users can view own symptom logs" ON public.symptom_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptom logs" ON public.symptom_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptom logs" ON public.symptom_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for notification_subscriptions
CREATE POLICY "Users can view own notification subscriptions" ON public.notification_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification subscriptions" ON public.notification_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification subscriptions" ON public.notification_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notification subscriptions" ON public.notification_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_cycle_baselines_updated_at
  BEFORE UPDATE ON public.cycle_baselines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminder_plans_updated_at
  BEFORE UPDATE ON public.reminder_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_cycle_baselines_user_id ON public.cycle_baselines(user_id);
CREATE INDEX idx_cycle_events_user_id ON public.cycle_events(user_id);
CREATE INDEX idx_phase_forecasts_user_date ON public.phase_forecasts(user_id, date);
CREATE INDEX idx_reminder_plans_user_id ON public.reminder_plans(user_id);
CREATE INDEX idx_reminder_events_user_id ON public.reminder_events(user_id);
CREATE INDEX idx_symptom_logs_user_date ON public.symptom_logs(user_id, date);