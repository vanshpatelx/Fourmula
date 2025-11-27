import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Heart, Search, Activity, Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface SymptomLog {
  id?: string;
  user_id?: string;
  date: string;
  mood?: number;
  energy?: number;
  sleep?: number;
  cramps?: number;
  bloating?: number;
  headache?: boolean;
  breast_tenderness?: boolean;
  nausea?: boolean;
  gas?: boolean;
  toilet_issues?: boolean;
  hot_flushes?: boolean;
  chills?: boolean;
  stress_headache?: boolean;
  dizziness?: boolean;
  ovulation?: boolean;
  bleeding_flow?: string;
  cravings?: string;
  mood_states?: string[];
  craving_types?: string[];
  notes?: string;
}

const Symptoms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mood');
  const [customSymptoms, setCustomSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');

  // Symptom states
  const [mood, setMood] = useState<number[]>([3]);
  const [energy, setEnergy] = useState<number[]>([3]);
  const [sleep, setSleep] = useState<number[]>([3]);
  const [cramps, setCramps] = useState<number[]>([1]);
  const [bloating, setBloating] = useState<number[]>([1]);
  const [headache, setHeadache] = useState(false);
  const [breastTenderness, setBreastTenderness] = useState(false);
  const [nausea, setNausea] = useState(false);
  const [gas, setGas] = useState(false);
  const [toiletIssues, setToiletIssues] = useState(false);
  const [hotFlushes, setHotFlushes] = useState(false);
  const [chills, setChills] = useState(false);
  const [stressHeadache, setStressHeadache] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [ovulation, setOvulation] = useState(false);
  const [bleedingFlow, setBleedingFlow] = useState('');
  const [cravings, setCravings] = useState('');
  const [moodStates, setMoodStates] = useState<string[]>([]);
  const [cravingTypes, setCravingTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadDayData();
    }
  }, [user, selectedDate]);

  const loadDayData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading symptom data:', error);
        return;
      }

      if (data) {
        setMood([data.mood || 3]);
        setEnergy([data.energy || 3]);
        setSleep([data.sleep || 3]);
        setCramps([data.cramps || 1]);
        setBloating([data.bloating || 1]);
        setHeadache(data.headache || false);
        setBreastTenderness(data.breast_tenderness || false);
        setNausea(data.nausea || false);
        setGas(data.gas || false);
        setToiletIssues(data.toilet_issues || false);
        setHotFlushes(data.hot_flushes || false);
        setChills(data.chills || false);
        setStressHeadache(data.stress_headache || false);
        setDizziness(data.dizziness || false);
        setOvulation(data.ovulation || false);
        setBleedingFlow(data.bleeding_flow || '');
        setCravings(data.cravings || '');
        setMoodStates(data.mood_states || []);
        setCravingTypes(data.craving_types || []);
        setNotes(data.notes || '');
      } else {
        // Reset form for new date
        setMood([3]);
        setEnergy([3]);
        setSleep([3]);
        setCramps([1]);
        setBloating([1]);
        setHeadache(false);
        setBreastTenderness(false);
        setNausea(false);
        setGas(false);
        setToiletIssues(false);
        setHotFlushes(false);
        setChills(false);
        setStressHeadache(false);
        setDizziness(false);
        setOvulation(false);
        setBleedingFlow('');
        setCravings('');
        setMoodStates([]);
        setCravingTypes([]);
        setNotes('');
      }
    } catch (error) {
      console.error('Error loading symptom data:', error);
    }
  };

  const saveSymptomLog = async () => {
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to save symptoms.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const logData: SymptomLog = {
        user_id: user.id,
        date: selectedDate,
        mood: mood[0] || null,
        energy: energy[0] || null,
        sleep: sleep[0] || null,
        cramps: cramps[0] || null,
        bloating: bloating[0] || null,
        headache,
        breast_tenderness: breastTenderness,
        nausea,
        gas,
        toilet_issues: toiletIssues,
        hot_flushes: hotFlushes,
        chills,
        stress_headache: stressHeadache,
        dizziness,
        ovulation,
        bleeding_flow: bleedingFlow || null,
        cravings: cravings || null,
        mood_states: moodStates.length > 0 ? moodStates : null,
        craving_types: cravingTypes.length > 0 ? cravingTypes : null,
        notes: notes || null,
      };

      console.log('Saving symptom log:', { user_id: user.id, date: selectedDate, logData });

      const { data, error } = await supabase
        .from('symptom_logs')
        .upsert(logData, {
          onConflict: 'user_id,date'
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Save successful:', data);

      toast({
        title: "💚 Symptoms tracked!",
        description: "Your wellness data has been recorded. Keep tracking to see your patterns!",
        duration: 5000,
      });

      // Reload data to get the updated record
      loadDayData();
    } catch (error: any) {
      console.error('Error saving symptom log:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      toast({
        title: "Error saving symptom log",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSliderEmoji = (value: number, type: 'mood' | 'cramps' | 'bloating') => {
    if (type === 'mood') {
      const emojis = ['😭', '😔', '😐', '😊', '😄'];
      return emojis[value - 1] || '😐';
    } else if (type === 'cramps') {
      const emojis = ['😊', '😐', '😣', '😰', '😵'];
      return emojis[value - 1] || '😊';
    } else {
      const emojis = ['😊', '😐', '😣', '😰', '😵'];
      return emojis[value - 1] || '😊';
    }
  };

  const handleMoodStateToggle = (state: string) => {
    setMoodStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleCravingToggle = (craving: string) => {
    setCravingTypes(prev => 
      prev.includes(craving) 
        ? prev.filter(c => c !== craving)
        : [...prev, craving]
    );
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

  const handleAddCustomSymptom = () => {
    if (newSymptom.trim()) {
      setCustomSymptoms(prev => [...prev, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const handleRemoveCustomSymptom = (symptom: string) => {
    setCustomSymptoms(prev => prev.filter(s => s !== symptom));
  };

  // Options for mood states and cravings
  const moodStateOptions = [
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'irritable', label: 'Irritable', emoji: '😤' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'motivated', label: 'Motivated', emoji: '💪' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
  ];

  const cravingOptions = [
    { value: 'sweet', label: 'Sweet foods', emoji: '🍰' },
    { value: 'salty', label: 'Salty foods', emoji: '🍟' },
    { value: 'carbs', label: 'Carbs craving', emoji: '🍞' },
    { value: 'sweets', label: 'Sweets craving', emoji: '🍭' },
    { value: 'alcohol', label: 'Alcohol', emoji: '🍷' },
  ];

  const bleedingOptions = [
    { value: 'light', label: 'Light bleeding', emoji: '🩸1' },
    { value: 'medium', label: 'Medium bleeding', emoji: '🩸2' },
    { value: 'heavy', label: 'Heavy bleeding', emoji: '🩸3' },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Wellness Log" showSearch={true}>
        <div className="flex-1 bg-white overflow-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Mobile Header with Floating Card */}
            <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 pb-8">
              <div className="p-6 pt-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Wellness</h1>
                    <p className="text-muted-foreground">Track your daily symptoms</p>
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
              {/* Mood Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{getSliderEmoji(mood[0], 'mood')}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Overall Mood</h3>
                    <p className="text-sm text-muted-foreground">How are you feeling today?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={mood}
                      onValueChange={setMood}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-primary/20 [&>.slider-track]:to-primary/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-primary [&>.slider-range]:to-primary/80 [&>.slider-thumb]:bg-primary [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Low</span>
                    <span>Neutral</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>

              {/* Mood States Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Mood States</h3>
                  <p className="text-sm text-muted-foreground">Select all that apply</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {moodStateOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMoodStateToggle(option.value)}
                      className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 border-2 ${
                        moodStates.includes(option.value)
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

              {/* Energy Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Energy Level</h3>
                    <p className="text-sm text-muted-foreground">Your energy today</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={energy}
                      onValueChange={setEnergy}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-amber/20 [&>.slider-track]:to-amber/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-amber-400 [&>.slider-range]:to-amber-500 [&>.slider-thumb]:bg-amber-500 [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Low</span>
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                    <span>Very High</span>
                  </div>
                </div>
              </div>

              {/* Sleep Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">😴</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Sleep Quality</h3>
                    <p className="text-sm text-muted-foreground">How well did you sleep?</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={sleep}
                      onValueChange={setSleep}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-blue/20 [&>.slider-track]:to-blue/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-blue-400 [&>.slider-range]:to-blue-500 [&>.slider-thumb]:bg-blue-500 [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Very Poor</span>
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>

              {/* Cramps Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{getSliderEmoji(cramps[0], 'cramps')}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Cramps</h3>
                    <p className="text-sm text-muted-foreground">Pain intensity level</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={cramps}
                      onValueChange={setCramps}
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
                    <span>Severe</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>

              {/* Bloating Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{getSliderEmoji(bloating[0], 'bloating')}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">Bloating</h3>
                    <p className="text-sm text-muted-foreground">Abdominal discomfort</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={bloating}
                      onValueChange={setBloating}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full [&>.slider-track]:bg-gradient-to-r [&>.slider-track]:from-orange/20 [&>.slider-track]:to-orange/40 [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-orange-400 [&>.slider-range]:to-orange-500 [&>.slider-thumb]:bg-orange-500 [&>.slider-thumb]:shadow-lg [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-white [&>.slider-range]:animate-pulse"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>None</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>

              {/* Bleeding Flow Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Bleeding Flow</h3>
                  <p className="text-sm text-muted-foreground">Select flow intensity</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {bleedingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBleedingFlow(bleedingFlow === option.value ? '' : option.value)}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-200 active:scale-95 border-2 ${
                        bleedingFlow === option.value
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-gray-50 border-gray-200 text-muted-foreground hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs font-medium text-center">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cravings Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Food Cravings</h3>
                  <p className="text-sm text-muted-foreground">What are you craving?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cravingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleCravingToggle(option.value)}
                      className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-200 active:scale-95 border-2 ${
                        cravingTypes.includes(option.value)
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

              {/* Symptoms Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground">Physical Symptoms</h3>
                  <p className="text-sm text-muted-foreground">Toggle experienced symptoms</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'headache', label: 'Headache', value: headache, setter: setHeadache, emoji: '🤕' },
                    { key: 'breast-tenderness', label: 'Breast Tenderness', value: breastTenderness, setter: setBreastTenderness, emoji: '💔' },
                    { key: 'nausea', label: 'Nausea', value: nausea, setter: setNausea, emoji: '🤢' },
                    { key: 'gas', label: 'Gas', value: gas, setter: setGas, emoji: '💨' },
                    { key: 'toilet-issues', label: 'Toilet Issues', value: toiletIssues, setter: setToiletIssues, emoji: '🚽' },
                    { key: 'hot-flushes', label: 'Hot Flushes', value: hotFlushes, setter: setHotFlushes, emoji: '🔥' },
                    { key: 'chills', label: 'Chills', value: chills, setter: setChills, emoji: '🥶' },
                    { key: 'stress-headache', label: 'Stress Headache', value: stressHeadache, setter: setStressHeadache, emoji: '😵' },
                    { key: 'dizziness', label: 'Dizziness', value: dizziness, setter: setDizziness, emoji: '😵‍💫' },
                    { key: 'ovulation', label: 'Ovulation', value: ovulation, setter: setOvulation, emoji: '🥚' },
                  ].map((symptom) => (
                    <div key={symptom.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{symptom.emoji}</span>
                        <Label htmlFor={symptom.key} className="font-medium text-foreground cursor-pointer">
                          {symptom.label}
                        </Label>
                      </div>
                      <Switch 
                        id={symptom.key} 
                        checked={symptom.value} 
                        onCheckedChange={symptom.setter}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">Any other observations?</p>
                </div>
                <Textarea
                  placeholder="Any additional symptoms or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="resize-none rounded-2xl border-2 border-gray-200 focus:border-primary bg-gray-50 text-base p-4"
                />
              </div>

              {/* Floating Save Button */}
              <div className="fixed bottom-20 left-4 right-4 z-40">
                <button 
                  onClick={saveSymptomLog}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-2xl font-semibold text-lg transition-all duration-300 active:scale-95 disabled:opacity-50 border border-gray-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Wellness Log'
                  )}
                </button>
              </div>
            </div>
          </div>


          {/* Desktop Layout - Tab Based */}
          <div className="hidden md:block min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-8">
              {/* Header with Date Selector */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Log</h1>
                  <p className="text-muted-foreground">Track your daily symptoms and well-being</p>
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

              {/* Main Card with Tabs */}
              <Card className="shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <CardHeader className="pb-4">
                    <TabsList className="w-full grid grid-cols-6 gap-2 bg-muted/50 p-1 h-auto">
                      <TabsTrigger value="mood" className="text-sm py-2.5">Mood</TabsTrigger>
                      <TabsTrigger value="energy" className="text-sm py-2.5">Energy Rest</TabsTrigger>
                      <TabsTrigger value="physical" className="text-sm py-2.5">Physical Discomfort</TabsTrigger>
                      <TabsTrigger value="other" className="text-sm py-2.5">Other Symptoms</TabsTrigger>
                      <TabsTrigger value="cycle" className="text-sm py-2.5">Cycle Information</TabsTrigger>
                      <TabsTrigger value="notes" className="text-sm py-2.5">Additional Notes</TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  <CardContent className="min-h-[500px]">
                    {/* Mood Tab */}
                    <TabsContent value="mood" className="space-y-6 mt-0">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-6xl mb-3">{getSliderEmoji(mood[0], 'mood')}</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Overall Mood</h3>
                          <p className="text-muted-foreground">How are you feeling today?</p>
                        </div>
                        
                        <div className="space-y-4 bg-muted/30 p-6 rounded-xl">
                          <Slider
                            value={mood}
                            onValueChange={setMood}
                            max={5}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>😭 Very Low</span>
                            <span>😔 Low</span>
                            <span>😐 Neutral</span>
                            <span>😊 Good</span>
                            <span>😄 Excellent</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Label className="text-lg font-medium text-foreground mb-4 block">Mood States</Label>
                          <p className="text-sm text-muted-foreground mb-4">Select all that apply</p>
                          <div className="grid grid-cols-3 gap-3">
                            {moodStateOptions.map((option) => (
                              <Button
                                key={option.value}
                                variant={moodStates.includes(option.value) ? "default" : "outline"}
                                onClick={() => handleMoodStateToggle(option.value)}
                                className="h-auto py-3 justify-start"
                              >
                                <span className="mr-2">{option.emoji}</span>
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Energy Rest Tab */}
                    <TabsContent value="energy" className="space-y-6 mt-0">
                      <div className="space-y-8">
                        <div className="text-center">
                          <div className="text-6xl mb-3">⚡</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Energy & Rest</h3>
                          <p className="text-muted-foreground">How energized and rested are you?</p>
                        </div>
                        
                        <div className="space-y-6 bg-muted/30 p-6 rounded-xl">
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-foreground">Energy Level</Label>
                            <Slider
                              value={energy}
                              onValueChange={setEnergy}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Very Low</span>
                              <span>Low</span>
                              <span>Moderate</span>
                              <span>High</span>
                              <span>Very High</span>
                            </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-border">
                            <Label className="text-lg font-semibold text-foreground flex items-center gap-2">
                              <span>😴</span>
                              Sleep Quality
                            </Label>
                            <Slider
                              value={sleep}
                              onValueChange={setSleep}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Very Poor</span>
                              <span>Poor</span>
                              <span>Fair</span>
                              <span>Good</span>
                              <span>Excellent</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Physical Discomfort Tab */}
                    <TabsContent value="physical" className="space-y-6 mt-0">
                      <div className="space-y-8">
                        <div className="text-center">
                          <div className="text-6xl mb-3">{getSliderEmoji(cramps[0], 'cramps')}</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Physical Discomfort</h3>
                          <p className="text-muted-foreground">Rate your pain levels and symptoms</p>
                        </div>
                        
                        <div className="space-y-6 bg-muted/30 p-6 rounded-xl">
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-foreground">Cramps</Label>
                            <Slider
                              value={cramps}
                              onValueChange={setCramps}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>None</span>
                              <span>Mild</span>
                              <span>Moderate</span>
                              <span>Severe</span>
                              <span>Extreme</span>
                            </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-border">
                            <Label className="text-lg font-semibold text-foreground">Bloating</Label>
                            <Slider
                              value={bloating}
                              onValueChange={setBloating}
                              max={5}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>None</span>
                              <span>Mild</span>
                              <span>Moderate</span>
                              <span>Severe</span>
                              <span>Extreme</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Label className="text-lg font-medium text-foreground mb-4 block">Physical Symptoms</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: 'headache', label: 'Headache', state: headache, setState: setHeadache, emoji: '🤕' },
                              { key: 'breast-tenderness', label: 'Breast Tenderness', state: breastTenderness, setState: setBreastTenderness, emoji: '💔' },
                              { key: 'nausea', label: 'Nausea', state: nausea, setState: setNausea, emoji: '🤢' },
                            ].map((symptom) => (
                              <div key={symptom.key} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                                <div className="flex items-center gap-2">
                                  <span>{symptom.emoji}</span>
                                  <Label htmlFor={symptom.key} className="font-medium cursor-pointer">{symptom.label}</Label>
                                </div>
                                <Switch 
                                  id={symptom.key} 
                                  checked={symptom.state} 
                                  onCheckedChange={symptom.setState} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Other Symptoms Tab */}
                    <TabsContent value="other" className="space-y-6 mt-0">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-6xl mb-3">🩺</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Other Symptoms</h3>
                          <p className="text-muted-foreground">Track additional symptoms</p>
                        </div>
                        
                        <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                          <Label className="text-lg font-medium text-foreground">Common Symptoms</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { key: 'gas', label: 'Gas', state: gas, setState: setGas, emoji: '💨' },
                              { key: 'toilet-issues', label: 'Toilet Issues', state: toiletIssues, setState: setToiletIssues, emoji: '🚽' },
                              { key: 'hot-flushes', label: 'Hot Flushes', state: hotFlushes, setState: setHotFlushes, emoji: '🔥' },
                              { key: 'chills', label: 'Chills', state: chills, setState: setChills, emoji: '🥶' },
                              { key: 'stress-headache', label: 'Stress Headache', state: stressHeadache, setState: setStressHeadache, emoji: '😵' },
                              { key: 'dizziness', label: 'Dizziness', state: dizziness, setState: setDizziness, emoji: '😵‍💫' },
                              { key: 'ovulation', label: 'Ovulation', state: ovulation, setState: setOvulation, emoji: '🥚' },
                            ].map((symptom) => (
                              <div key={symptom.key} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                                <div className="flex items-center gap-2">
                                  <span>{symptom.emoji}</span>
                                  <Label htmlFor={symptom.key} className="font-medium cursor-pointer">{symptom.label}</Label>
                                </div>
                                <Switch 
                                  id={symptom.key} 
                                  checked={symptom.state} 
                                  onCheckedChange={symptom.setState} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <Label className="text-lg font-medium text-foreground mb-4 block">Custom Symptoms</Label>
                          <p className="text-sm text-muted-foreground mb-4">Add your own symptoms to track</p>
                          
                          <div className="flex gap-2 mb-4">
                            <Input
                              placeholder="Enter symptom name..."
                              value={newSymptom}
                              onChange={(e) => setNewSymptom(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
                              className="flex-1"
                            />
                            <Button onClick={handleAddCustomSymptom} size="icon">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {customSymptoms.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {customSymptoms.map((symptom, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                                  {symptom}
                                  <button
                                    onClick={() => handleRemoveCustomSymptom(symptom)}
                                    className="ml-2 hover:text-destructive"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Cycle Information Tab */}
                    <TabsContent value="cycle" className="space-y-6 mt-0">
                      <div className="space-y-8">
                        <div className="text-center">
                          <div className="text-6xl mb-3">🩸</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Cycle Information</h3>
                          <p className="text-muted-foreground">Track bleeding and cravings</p>
                        </div>
                        
                        <div className="space-y-6 bg-muted/30 p-6 rounded-xl">
                          <div className="space-y-4">
                            <Label className="text-lg font-semibold text-foreground">Bleeding Flow</Label>
                            <div className="grid grid-cols-3 gap-3">
                              {bleedingOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  variant={bleedingFlow === option.value ? "default" : "outline"}
                                  onClick={() => setBleedingFlow(bleedingFlow === option.value ? '' : option.value)}
                                  className="h-auto py-4 text-base"
                                >
                                  <span className="mr-2">{option.emoji}</span>
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-border">
                            <Label className="text-lg font-semibold text-foreground">Food Cravings</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {cravingOptions.map((option) => (
                                <Button
                                  key={option.value}
                                  variant={cravingTypes.includes(option.value) ? "default" : "outline"}
                                  onClick={() => handleCravingToggle(option.value)}
                                  className="h-auto py-3 text-base justify-start"
                                >
                                  <span className="mr-2">{option.emoji}</span>
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Additional Notes Tab */}
                    <TabsContent value="notes" className="space-y-6 mt-0">
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-6xl mb-3">📝</div>
                          <h3 className="text-2xl font-semibold text-foreground mb-2">Additional Notes</h3>
                          <p className="text-muted-foreground">Add any extra observations</p>
                        </div>
                        
                        <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                          <Label className="text-lg font-medium text-foreground">Notes</Label>
                          <Textarea
                            placeholder="Any additional symptoms, observations, or notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={8}
                            className="w-full text-base resize-none"
                          />
                        </div>

                        <div className="pt-4 border-t border-border">
                          <h4 className="font-semibold text-foreground mb-4">Quick Summary</h4>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-background rounded-lg border border-border">
                              <div className="text-3xl mb-2">{getSliderEmoji(mood[0], 'mood')}</div>
                              <div className="text-xs text-muted-foreground">Mood</div>
                            </div>
                            <div className="p-4 bg-background rounded-lg border border-border">
                              <div className="text-3xl mb-2">⚡</div>
                              <div className="text-xs text-muted-foreground">Energy: {energy[0]}/5</div>
                            </div>
                            <div className="p-4 bg-background rounded-lg border border-border">
                              <div className="text-3xl mb-2">😴</div>
                              <div className="text-xs text-muted-foreground">Sleep: {sleep[0]}/5</div>
                            </div>
                            <div className="p-4 bg-background rounded-lg border border-border">
                              <div className="text-3xl mb-2">{getSliderEmoji(cramps[0], 'cramps')}</div>
                              <div className="text-xs text-muted-foreground">Cramps: {cramps[0]}/5</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>

                  {/* Save Button */}
                  <div className="px-6 pb-6">
                    <Button
                      onClick={saveSymptomLog}
                      disabled={loading}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {loading ? 'Saving...' : 'Save Wellness Log'}
                    </Button>
                  </div>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Symptoms;