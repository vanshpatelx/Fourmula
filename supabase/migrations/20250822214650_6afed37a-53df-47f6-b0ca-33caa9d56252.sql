-- Generate phase forecasts directly for the user
-- This bypasses the failing edge function and generates the needed data

DO $$
DECLARE
    baseline_record RECORD;
    forecast_date DATE;
    cycle_day INTEGER;
    phase_name TEXT;
    confidence_value NUMERIC;
    i INTEGER;
BEGIN
    -- Get the user's cycle baseline
    SELECT * INTO baseline_record 
    FROM cycle_baselines 
    WHERE user_id = '4cd559bf-bcf6-4a68-be65-525ca9916381'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF baseline_record IS NULL THEN
        RAISE EXCEPTION 'No cycle baseline found for user';
    END IF;
    
    -- Delete existing forecasts for this user
    DELETE FROM phase_forecasts 
    WHERE user_id = '4cd559bf-bcf6-4a68-be65-525ca9916381';
    
    -- Generate 90 days of forecasts starting from last period
    FOR i IN 0..89 LOOP
        forecast_date := baseline_record.last_period_start + i;
        cycle_day := (i % baseline_record.avg_cycle_len) + 1;
        
        -- Determine phase based on cycle day
        IF cycle_day <= 5 THEN
            phase_name := 'menstrual';
            confidence_value := 0.9;
        ELSIF cycle_day <= (baseline_record.avg_cycle_len - baseline_record.luteal_len) THEN
            phase_name := 'follicular';
            confidence_value := 0.8;
        ELSIF cycle_day <= (baseline_record.avg_cycle_len - baseline_record.luteal_len + 3) THEN
            phase_name := 'ovulatory';
            confidence_value := 0.7;
        ELSE
            phase_name := 'luteal';
            confidence_value := 0.8;
        END IF;
        
        -- Insert the forecast
        INSERT INTO phase_forecasts (user_id, date, phase, confidence)
        VALUES (
            '4cd559bf-bcf6-4a68-be65-525ca9916381',
            forecast_date,
            phase_name,
            confidence_value
        );
    END LOOP;
    
    RAISE NOTICE 'Successfully generated 90 phase forecasts starting from %', baseline_record.last_period_start;
END $$;