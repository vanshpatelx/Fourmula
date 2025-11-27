import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell,
  Search as SearchIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface TrainingLog {
  id?: string;
  user_id?: string;
  date: string;
  training_load?: string;
  soreness?: number;
  fatigue?: number;
  workout_types?: string[];
  pb_type?: string;
  pb_value?: string;
  notes?: string;
}

const Training = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [trainingLoad, setTrainingLoad] = useState<number[]>([2]);
  const [soreness, setSoreness] = useState<number[]>([1]);
  const [fatigue, setFatigue] = useState<number[]>([1]);
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [pbType, setPbType] = useState<string>('');
  const [pbValue, setPbValue] = useState('');
  const [trainingNotes, setTrainingNotes] = useState('');

  const workoutTypeOptions = [
    { value: 'cardio', label: 'Cardio', emoji: '🏃‍♀️' },
    { value: 'strength', label: 'Strength', emoji: '💪' },
    { value: 'hiit', label: 'HIIT', emoji: '🔥' },
    { value: 'yoga', label: 'Yoga', emoji: '🧘‍♀️' },
    { value: 'pilates', label: 'Pilates', emoji: '🤸‍♀️' },
    { value: 'dance', label: 'Dance', emoji: '💃' },
    { value: 'swimming', label: 'Swimming', emoji: '🏊‍♀️' },
    { value: 'cycling', label: 'Cycling', emoji: '🚴‍♀️' },
    { value: 'running', label: 'Running', emoji: '🏃‍♀️' },
    { value: 'walking', label: 'Walking', emoji: '🚶‍♀️' },
    { value: 'legs', label: 'Legs', emoji: '🦵' },
    { value: 'arms', label: 'Arms', emoji: '💪' },
    { value: 'back', label: 'Back', emoji: '🏋️‍♀️' },
    { value: 'chest', label: 'Chest', emoji: '💪' },
    { value: 'core', label: 'Core', emoji: '🏋️‍♀️' },
    { value: 'full_body', label: 'Full Body', emoji: '🏋️‍♀️' },
  ];

  const availablePbOptions = workoutTypeOptions.filter(option => 
    workoutTypes.includes(option.value)
  );

  useEffect(() => {
    if (user) {
      loadDayData();
    }
  }, [user, selectedDate]);

  const loadDayData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('training_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading training data:', error);
        return;
      }

      if (data) {
        // Map training load text value back to slider value
        const trainingLoadMap = ['rest', 'easy', 'moderate', 'hard'];
        const trainingLoadIndex = trainingLoadMap.indexOf(data.training_load) !== -1 
          ? trainingLoadMap.indexOf(data.training_load) 
          : 2; // default to 'moderate' if not found
        setTrainingLoad([trainingLoadIndex]);
        setSoreness([Number(data.soreness) || 1]);
        setFatigue([Number(data.fatigue) || 1]);
        setWorkoutTypes(Array.isArray(data.workout_types) ? data.workout_types : []);
        setPbType(data.pb_type || '');
        setPbValue(data.pb_value || '');
        setTrainingNotes(data.notes || '');
      } else {
        // Reset form for new date
        setTrainingLoad([2]);
        setSoreness([1]);
        setFatigue([1]);
        setWorkoutTypes([]);
        setPbType('');
        setPbValue('');
        setTrainingNotes('');
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  const saveTrainingLog = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Map training load slider value to database text value
      const trainingLoadMap = ['rest', 'easy', 'moderate', 'hard'];
      
      const logData = {
        user_id: user.id,
        date: selectedDate,
        training_load: trainingLoadMap[trainingLoad[0]],
        soreness: soreness[0],
        fatigue: fatigue[0],
        workout_types: workoutTypes,
        pb_type: pbType,
        pb_value: pbValue,
        notes: trainingNotes,
      };

      const { error } = await supabase
        .from('training_logs')
        .upsert(logData, {
          onConflict: 'user_id,date'
        });

      if (error) {
        console.error('Error saving training log:', error);
        throw error;
      }

      toast({
        title: "🏋️ Training logged successfully!",
        description: `Great workout! ${workoutTypes.length > 0 ? `Completed: ${workoutTypes.join(', ')}` : 'Keep up the great work!'}`,
        duration: 5000,
      });

      // Update training challenges and achievements
      try {
        await supabase.functions.invoke('update-training-challenges', {
          body: { user_id: user.id }
        });
      } catch (error) {
        console.error('Error updating challenges:', error);
      }

      // Reload data to get the updated record
      loadDayData();
    } catch (error: any) {
      console.error('Error saving training log:', error);
      
      // Provide more specific error messages
      let errorMessage = "Please try again.";
      if (error.message) {
        if (error.message.includes('check constraint')) {
          errorMessage = "Invalid values detected. Please check your input.";
        } else if (error.message.includes('unique constraint')) {
          errorMessage = "A log for this date already exists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error saving training log",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSliderEmoji = (value: number, type: 'soreness' | 'fatigue') => {
    if (type === 'soreness') {
      const emojis = ['😊', '😐', '😣', '😰', '😵'];
      return emojis[value - 1] || '😊';
    } else {
      const emojis = ['⚡', '😊', '😐', '😴', '💤'];
      return emojis[value - 1] || '⚡';
    }
  };

  const toggleWorkoutType = (type: string) => {
    setWorkoutTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const togglePbType = (type: string) => {
    setPbType(prev => prev === type ? '' : type);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Training Log" showSearch={true}>
        <div className="flex-1 bg-white overflow-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Mobile Header with Floating Card */}
            <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 pb-8">
              <div className="p-6 pt-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Training</h1>
                    <p className="text-muted-foreground">Track your fitness journey</p>
                  </div>
                </div>

                {/* Floating Date Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => navigateDate('prev')}
                      className="w-12 h-12 rounded-2xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5 text-primary" />
                    </button>
                    
                    <div className="text-center">
                      <div className="text-3xl font-light text-foreground mb-1">
                        {new Date(selectedDate).getDate()}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long'
                        })}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigateDate('next')}
                      className="w-12 h-12 rounded-2xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-200 active:scale-95"
                    >
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Form Cards */}
            <div className="p-4 space-y-4 pb-32">
              {/* Training Load Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Training Load</h3>
                    <p className="text-sm text-muted-foreground">How intense was your workout?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={trainingLoad}
                      onValueChange={setTrainingLoad}
                      max={3}
                      min={0}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-primary/20 [&>.slider-track]:to-primary/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-primary [&>.slider-range]:to-primary/80 [&>.slider-thumb]:bg-primary [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Rest</span>
                    <span>Easy</span>
                    <span>Moderate</span>
                    <span>Hard</span>
                  </div>
                </div>
              </div>

              {/* Workout Types Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Workout Types</h3>
                  <p className="text-sm text-muted-foreground">What did you focus on?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {workoutTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleWorkoutType(option.value)}
                      className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 border-2 ${
                        workoutTypes.includes(option.value)
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-gray-50 border-gray-200 text-muted-foreground hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Best Card */}
              {workoutTypes.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground">Personal Best</h3>
                    <p className="text-sm text-muted-foreground">Did you hit a new record?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {availablePbOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => togglePbType(option.value)}
                          className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 border-2 ${
                            pbType === option.value
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-gray-50 border-gray-200 text-muted-foreground hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-lg">{option.emoji}</span>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                    {pbType && (
                      <Input
                        placeholder="e.g., '10 push-ups', '5km in 25 min'"
                        value={pbValue}
                        onChange={(e) => setPbValue(e.target.value)}
                        className="h-12 rounded-2xl border-2 border-gray-200 focus:border-primary bg-gray-50 text-base"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Soreness Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{getSliderEmoji(soreness[0], 'soreness')}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Soreness Level</h3>
                    <p className="text-sm text-muted-foreground">How do your muscles feel?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={soreness}
                      onValueChange={setSoreness}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-red/20 [&>.slider-track]:to-red/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-red-400 [&>.slider-range]:to-red-500 [&>.slider-thumb]:bg-red-500 [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>None</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>

              {/* Fatigue Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{getSliderEmoji(fatigue[0], 'fatigue')}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Fatigue Level</h3>
                    <p className="text-sm text-muted-foreground">How tired do you feel?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={fatigue}
                      onValueChange={setFatigue}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-blue/20 [&>.slider-track]:to-blue/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-blue-400 [&>.slider-range]:to-blue-500 [&>.slider-thumb]:bg-blue-500 [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Energetic</span>
                    <span>Fresh</span>
                    <span>Neutral</span>
                    <span>Tired</span>
                    <span>Exhausted</span>
                  </div>
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Training Notes</h3>
                  <p className="text-sm text-muted-foreground">Any additional thoughts?</p>
                </div>
                <Textarea
                  placeholder="How did your workout go? Any observations..."
                  value={trainingNotes}
                  onChange={(e) => setTrainingNotes(e.target.value)}
                  className="min-h-[100px] rounded-2xl border-2 border-gray-200 focus:border-primary bg-gray-50 resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <Button 
                  onClick={saveTrainingLog}
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  {loading ? "Saving..." : "Save Training Log"}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Clean Single Page */}
          <div className="hidden md:block min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-8">
              {/* Header with Date Selector */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Training Log</h1>
                  <p className="text-muted-foreground">Track your fitness journey and progress</p>
                </div>
                
                <div className="flex items-center gap-4 bg-card px-6 py-3 rounded-2xl border border-border shadow-sm">
                  <button 
                    onClick={() => navigateDate('prev')}
                    className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  
                  <div className="text-center min-w-[250px]">
                    <div className="text-lg font-bold text-foreground">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigateDate('next')}
                    className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Training Load & Workout Types */}
                <div className="col-span-2 space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">💪</span>
                        Training Intensity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium text-foreground flex items-center gap-2">
                          <span>⚡</span>
                          Training Load
                        </Label>
                        <Slider
                          value={trainingLoad}
                          onValueChange={setTrainingLoad}
                          max={3}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Rest</span>
                          <span>Easy</span>
                          <span>Moderate</span>
                          <span>Hard</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🏋️‍♀️</span>
                        Workout Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-3">
                        {workoutTypeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={workoutTypes.includes(option.value) ? "default" : "outline"}
                            onClick={() => toggleWorkoutType(option.value)}
                            className="h-auto py-3 flex-col gap-1"
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="text-xs">{option.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {workoutTypes.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">🏆</span>
                          Personal Best
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          {availablePbOptions.map((option) => (
                            <Button
                              key={option.value}
                              variant={pbType === option.value ? "default" : "outline"}
                              onClick={() => togglePbType(option.value)}
                              className="h-auto py-3 flex-col gap-1"
                            >
                              <span className="text-lg">{option.emoji}</span>
                              <span className="text-xs">{option.label}</span>
                            </Button>
                          ))}
                        </div>
                        
                        {pbType && (
                          <Input
                            placeholder="e.g., '10 push-ups', '5km in 25 min'"
                            value={pbValue}
                            onChange={(e) => setPbValue(e.target.value)}
                            className="h-12 text-base"
                          />
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column - Recovery & Notes */}
                <div className="space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🏃‍♀️</span>
                        Recovery
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <Label className="text-base font-medium text-foreground flex items-center gap-2">
                          <span>{getSliderEmoji(soreness[0], 'soreness')}</span>
                          Soreness
                        </Label>
                        <Slider
                          value={soreness}
                          onValueChange={setSoreness}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground text-center">
                          <span>None</span>
                          <span>Mild</span>
                          <span>Mod</span>
                          <span>High</span>
                          <span>Severe</span>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border">
                        <Label className="text-base font-medium text-foreground flex items-center gap-2">
                          <span>{getSliderEmoji(fatigue[0], 'fatigue')}</span>
                          Fatigue
                        </Label>
                        <Slider
                          value={fatigue}
                          onValueChange={setFatigue}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <div className="grid grid-cols-5 gap-1 text-xs text-muted-foreground text-center">
                          <span>Fresh</span>
                          <span>Good</span>
                          <span>Ok</span>
                          <span>Tired</span>
                          <span>Dead</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="How did your workout go? Any observations or achievements..."
                        value={trainingNotes}
                        onChange={(e) => setTrainingNotes(e.target.value)}
                        rows={10}
                        className="w-full text-base resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <Button
                  onClick={saveTrainingLog}
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {loading ? 'Saving...' : 'Save Training Log'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Training;
