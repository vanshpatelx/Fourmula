-- Add a log_symptom_data function to allow AI to log symptoms and notes
CREATE OR REPLACE FUNCTION log_symptom_data(
  user_id_param UUID,
  date_param DATE,
  notes_param TEXT DEFAULT NULL,
  mood_param INTEGER DEFAULT NULL,
  energy_param INTEGER DEFAULT NULL,
  sleep_param INTEGER DEFAULT NULL,
  cramps_param INTEGER DEFAULT NULL,
  bloating_param INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.symptom_logs (
    user_id, date, notes, mood, energy, sleep, cramps, bloating
  ) VALUES (
    user_id_param, date_param, notes_param, mood_param, energy_param, sleep_param, cramps_param, bloating_param
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    notes = COALESCE(log_symptom_data.notes_param, symptom_logs.notes),
    mood = COALESCE(log_symptom_data.mood_param, symptom_logs.mood),
    energy = COALESCE(log_symptom_data.energy_param, symptom_logs.energy),
    sleep = COALESCE(log_symptom_data.sleep_param, symptom_logs.sleep),
    cramps = COALESCE(log_symptom_data.cramps_param, symptom_logs.cramps),
    bloating = COALESCE(log_symptom_data.bloating_param, symptom_logs.bloating);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;