import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PhaseData {
  date: string;
  phase: string;
  confidence: number;
}

interface CycleEvent {
  date: string;
  type: string;
}

interface SymptomLog {
  date: string;
  mood?: number;
  energy?: number;
  sleep?: number;
  cramps?: number;
  bloating?: number;
  headache?: boolean;
  breast_tenderness?: boolean;
  cravings?: string;
  training_load?: number;
  notes?: string;
  nausea?: boolean;
  gas?: boolean;
  toilet_issues?: boolean;
  bleeding_flow?: string;
  ovulation?: boolean;
  mood_states?: string[];
  hot_flushes?: boolean;
  chills?: boolean;
  stress_headache?: boolean;
  dizziness?: boolean;
  craving_types?: string[];
}

interface TrainingLog {
  date: string;
  soreness?: number;
  fatigue?: number;
  training_load?: string;
  workout_types?: string[];
  pb_type?: string;
  pb_value?: string;
  notes?: string;
}

interface ReminderEvent {
  date: string;
  status: string;
  channel: string;
}

interface DayDetailsProps {
  date: string;
  showBackButton?: boolean;
}

export const DayDetails = ({ date, showBackButton = true }: DayDetailsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phaseInfo, setPhaseInfo] = useState<PhaseData | null>(null);
  const [cycleEvent, setCycleEvent] = useState<CycleEvent | null>(null);
  const [symptomLog, setSymptomLog] = useState<SymptomLog | null>(null);
  const [trainingLog, setTrainingLog] = useState<TrainingLog | null>(null);
  const [reminderEvent, setReminderEvent] = useState<ReminderEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && date) {
      loadDayData();
    }
  }, [user, date]);

  const loadDayData = async () => {
    if (!date || !user?.id) return;

    setPhaseInfo(null);
    setCycleEvent(null);
    setSymptomLog(null);
    setTrainingLog(null);
    setReminderEvent(null);

    try {
      setLoading(true);

      const { data: phases } = await supabase
        .from('phase_forecasts')
        .select('date, phase, confidence')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      const { data: events } = await supabase
        .from('cycle_events')
        .select('date, type')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      const { data: symptoms } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      const { data: training } = await supabase
        .from('training_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      const dayStart = new Date(date + 'T00:00:00').toISOString();
      const dayEnd = new Date(date + 'T23:59:59').toISOString();
      
      const { data: reminder } = await supabase
        .from('reminder_events')
        .select('scheduled_for, status, channel')
        .eq('user_id', user.id)
        .eq('status', 'taken')
        .gte('scheduled_for', dayStart)
        .lte('scheduled_for', dayEnd)
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .maybeSingle();

      setPhaseInfo(phases ?? null);
      setCycleEvent(events ?? null);
      setSymptomLog(symptoms ?? null);
      setTrainingLog(training ?? null);
      setReminderEvent(reminder ? {
        date: reminder.scheduled_for.split('T')[0],
        status: reminder.status,
        channel: reminder.channel
      } : null);
    } catch (error) {
      console.error('Error loading day data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background overflow-auto">
      {showBackButton && (
        <div className="px-6 py-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/calendar')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      )}

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycle & Symptoms Card */}
          {(cycleEvent || symptomLog) && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {cycleEvent && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-3xl">🩸</span>
                    <span className="font-medium">Period Day</span>
                  </div>
                )}

                {symptomLog && (
                  <div className="space-y-6">
                    {/* Mood, Energy, Sleep */}
                    {(symptomLog.mood || symptomLog.energy || symptomLog.sleep) && (
                      <div className="grid grid-cols-3 gap-4">
                        {symptomLog.mood && (
                          <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                            <span className="text-3xl">
                              {symptomLog.mood <= 2 ? '😢' : symptomLog.mood === 3 ? '😐' : '😊'}
                            </span>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Mood</p>
                              <p className="text-base font-semibold">{symptomLog.mood}/5</p>
                            </div>
                          </div>
                        )}
                        {symptomLog.energy && (
                          <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                            <span className="text-3xl">
                              {symptomLog.energy <= 2 ? '🔋' : symptomLog.energy === 3 ? '⚡' : '✨'}
                            </span>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Energy</p>
                              <p className="text-base font-semibold">{symptomLog.energy}/5</p>
                            </div>
                          </div>
                        )}
                        {symptomLog.sleep && (
                          <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                            <span className="text-3xl">
                              {symptomLog.sleep <= 2 ? '😴' : symptomLog.sleep === 3 ? '🌙' : '✨'}
                            </span>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Sleep</p>
                              <p className="text-base font-semibold">{symptomLog.sleep}/5</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Physical Symptoms */}
                    <div className="space-y-3">
                      {symptomLog.cramps && symptomLog.cramps > 0 && (
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💢</span>
                            <span className="font-medium">Cramps</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {symptomLog.cramps === 1 ? 'Mild' : symptomLog.cramps === 2 ? 'Moderate' : 'Severe'}
                          </span>
                        </div>
                      )}
                      {symptomLog.bloating && symptomLog.bloating > 0 && (
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🎈</span>
                            <span className="font-medium">Bloating</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {symptomLog.bloating === 1 ? 'Mild' : symptomLog.bloating === 2 ? 'Moderate' : 'Severe'}
                          </span>
                        </div>
                      )}
                      {symptomLog.stress_headache && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-2xl">😵</span>
                          <span className="font-medium">Stress Headache</span>
                        </div>
                      )}
                      {symptomLog.headache && !symptomLog.stress_headache && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-2xl">🤕</span>
                          <span className="font-medium">Headache</span>
                        </div>
                      )}
                      {symptomLog.breast_tenderness && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-2xl">🍒</span>
                          <span className="font-medium">Breast Tenderness</span>
                        </div>
                      )}
                      {symptomLog.nausea && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-2xl">🤢</span>
                          <span className="font-medium">Nausea</span>
                        </div>
                      )}
                      {symptomLog.ovulation && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-2xl">🥚</span>
                          <span className="font-medium">Ovulation</span>
                        </div>
                      )}
                    </div>

                    {/* Cravings */}
                    {symptomLog.craving_types && symptomLog.craving_types.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Cravings</p>
                        <div className="flex flex-wrap gap-2">
                          {symptomLog.craving_types.map((type, index) => {
                            const cravingEmoji = type === 'chocolate' ? '🍫' :
                                               type === 'sweets' ? '🍭' :
                                               type === 'salty' ? '🧂' :
                                               type === 'carbs' ? '🍞' :
                                               type === 'alcohol' ? '🍷' : '🍴';
                            return (
                              <span key={index} className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                                <span className="text-xl">{cravingEmoji}</span>
                                <span className="text-sm font-medium">{type}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {symptomLog.notes && (
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Notes</p>
                        <p className="text-sm leading-relaxed">{symptomLog.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Training & Activities Card */}
          {trainingLog && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Training Load */}
                {trainingLog.training_load && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-3xl">
                      {trainingLog.training_load === 'rest' && '🛌'}
                      {trainingLog.training_load === 'easy' && '😊'}
                      {trainingLog.training_load === 'moderate' && '💪'}
                      {trainingLog.training_load === 'hard' && '🔥'}
                    </span>
                    <span className="font-medium">{trainingLog.training_load.charAt(0).toUpperCase() + trainingLog.training_load.slice(1)} Day</span>
                  </div>
                )}

                {/* Workout Types */}
                {trainingLog.workout_types && trainingLog.workout_types.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Workout Types</p>
                    <div className="flex flex-wrap gap-2">
                      {trainingLog.workout_types.map((type, index) => {
                        const workoutEmojis: Record<string, string> = {
                          'glutes': '🍑', 'legs': '🦵', 'arms': '💪', 'chest': '💪', 'shoulders': '🙆', 'back': '🦴', 'core': '👙',
                          'weightlifting': '🏋️‍♀️', 'hiit': '🔥',
                          'running': '🏃‍♀️', 'cycling': '🚴‍♀️', 'swimming': '🏊‍♀️', 'walking': '🚶‍♀️',
                          'yoga': '🧘‍♀️', 'pilates': '🧎‍♀️', 'dance': '💃',
                          'rest': '🛌', 'massage': '💆‍♀️'
                        };
                        const emoji = workoutEmojis[type] || '🏃‍♀️';
                        return (
                          <span key={index} className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                            <span className="text-xl">{emoji}</span>
                            <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Personal Best */}
                {trainingLog.pb_value && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                    <span className="text-3xl">🏅</span>
                    <div>
                      <p className="font-semibold">{trainingLog.pb_value}</p>
                      {trainingLog.pb_type && (
                        <p className="text-xs text-muted-foreground">{trainingLog.pb_type}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recovery Metrics */}
                {(trainingLog.soreness || trainingLog.fatigue) && (
                  <div className="grid grid-cols-2 gap-4">
                    {trainingLog.soreness && trainingLog.soreness > 0 && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                        <span className="text-3xl">💢</span>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Soreness</p>
                          <p className="text-base font-semibold">
                            {trainingLog.soreness === 1 ? 'Mild' : trainingLog.soreness === 2 ? 'Moderate' : 'Severe'}
                          </p>
                        </div>
                      </div>
                    )}
                    {trainingLog.fatigue && trainingLog.fatigue > 0 && (
                      <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-lg">
                        <span className="text-3xl">😴</span>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Fatigue</p>
                          <p className="text-base font-semibold">
                            {trainingLog.fatigue === 1 ? 'Mild' : trainingLog.fatigue === 2 ? 'Moderate' : 'Severe'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Training Notes */}
                {trainingLog.notes && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Notes</p>
                    <p className="text-sm leading-relaxed">{trainingLog.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Supplements Card */}
          {reminderEvent && (
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Supplements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <span className="text-3xl">💊</span>
                  <span className="font-medium">Fourmula supplement taken</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* No Data Message */}
        {!cycleEvent && !symptomLog && !trainingLog && !reminderEvent && (
          <Card className="shadow-sm mt-6">
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-base text-muted-foreground mb-6">
                No data logged for this day
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/symptoms')}
                >
                  Log Symptoms
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/training')}
                >
                  Log Training
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
