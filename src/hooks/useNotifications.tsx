import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReminderPlan {
  time_local: string;
  timezone: string;
  reminders_enabled: boolean;
  phase_a_time: string | null;
  phase_b_time: string | null;
  phase_a_training_days_only: boolean;
  regimen: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [reminderPhase, setReminderPhase] = useState<'A' | 'B' | null>(null);
  const [reminderPlan, setReminderPlan] = useState<ReminderPlan | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadReminderPlan = async () => {
      const { data } = await supabase
        .from('reminder_plans')
        .select('time_local, timezone, reminders_enabled, phase_a_time, phase_b_time, phase_a_training_days_only, regimen')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && data.reminders_enabled) {
        setReminderPlan(data);
      }
    };

    loadReminderPlan();
  }, [user]);

  useEffect(() => {
    if (!user || !reminderPlan || !reminderPlan.reminders_enabled) return;

    const checkReminder = async () => {
      const now = new Date();
      const today = now.toDateString();

      // Check Phase A reminder (morning, training days only)
      if (reminderPlan.phase_a_time && (reminderPlan.regimen === 'phase_a' || reminderPlan.regimen === 'both')) {
        const [phaseAHour, phaseAMinute] = reminderPlan.phase_a_time.split(':').map(Number);
        
        if (now.getHours() === phaseAHour && now.getMinutes() === phaseAMinute) {
          const lastShownKey = `lastPhaseAReminderShown_${user.id}`;
          const lastShown = localStorage.getItem(lastShownKey);
          
          if (lastShown !== today) {
            // Check if user has training logged for today if required
            if (reminderPlan.phase_a_training_days_only) {
              const { data } = await supabase
                .from('training_logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('date', now.toISOString().split('T')[0])
                .maybeSingle();
              
              if (data) {
                setReminderPhase('A');
                setShowReminder(true);
                localStorage.setItem(lastShownKey, today);
              }
            } else {
              setReminderPhase('A');
              setShowReminder(true);
              localStorage.setItem(lastShownKey, today);
            }
          }
        }
      }

      // Check Phase B reminder (evening)
      if (reminderPlan.phase_b_time && (reminderPlan.regimen === 'phase_b' || reminderPlan.regimen === 'both' || reminderPlan.regimen === 'daily')) {
        const [phaseBHour, phaseBMinute] = reminderPlan.phase_b_time.split(':').map(Number);
        
        if (now.getHours() === phaseBHour && now.getMinutes() === phaseBMinute) {
          const lastShownKey = `lastPhaseBReminderShown_${user.id}`;
          const lastShown = localStorage.getItem(lastShownKey);
          
          if (lastShown !== today) {
            setReminderPhase('B');
            setShowReminder(true);
            localStorage.setItem(lastShownKey, today);
          }
        }
      }
    };

    // Check immediately
    checkReminder();

    // Check every minute
    const interval = setInterval(checkReminder, 60000);

    return () => clearInterval(interval);
  }, [user, reminderPlan]);

  const hideReminder = () => {
    setShowReminder(false);
    setReminderPhase(null);
  };

  return { showReminder, hideReminder, reminderPhase };
};
