import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarIcon, Heart, Activity, X, ChevronDown, Grid3x3, List } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';
import { DayDetails } from '@/components/calendar/DayDetails';

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

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [phaseData, setPhaseData] = useState<PhaseData[]>([]);
  const [cycleEvents, setCycleEvents] = useState<CycleEvent[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [reminderEvents, setReminderEvents] = useState<ReminderEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'twoWeek'>('month');
  const [mobileViewFilter, setMobileViewFilter] = useState<'month' | 'week'>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return startOfWeek;
  });
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [dayCarouselApi, setDayCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedDayForCarousel, setSelectedDayForCarousel] = useState<Date>(new Date());
  const [mobileViewMode, setMobileViewMode] = useState<'card' | 'table'>('card');
  const [emojiDrawerOpen, setEmojiDrawerOpen] = useState(false);
  const [selectedDayForEmojis, setSelectedDayForEmojis] = useState<string | null>(null);

  // Reset to today's date on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSelectedDayForCarousel(new Date());
    }
  }, [isMobile]);

  const loadCalendarData = async () => {
    try {
      if (!user?.id) {
        console.error('No user ID available, cannot load data');
        return;
      }
      let firstDay: Date, lastDay: Date;
      
      if (viewMode === 'month') {
        firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else if (viewMode === 'week') {
        firstDay = new Date(currentWeekStart);
        lastDay = new Date(currentWeekStart);
        lastDay.setDate(lastDay.getDate() + 6);
      } else {
        firstDay = new Date(currentWeekStart);
        lastDay = new Date(currentWeekStart);
        lastDay.setDate(lastDay.getDate() + 13);
      }

      const formatDate = (date: Date) => 
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const firstDayStr = formatDate(firstDay);
      const lastDayStr = formatDate(lastDay);

      // Load phase forecasts
      const { data: phases, error: phaseError } = await supabase
        .from('phase_forecasts')
        .select('date, phase, confidence')
        .eq('user_id', user?.id)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr)
        .order('date');

      if (phaseError) throw phaseError;

      // Load cycle events
      const { data: events, error: eventError } = await supabase
        .from('cycle_events')
        .select('date, type')
        .eq('user_id', user?.id)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr)
        .order('date');

      if (eventError) throw eventError;

      // Load symptom logs
      const { data: symptoms, error: symptomError } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr)
        .order('date');

      if (symptomError) throw symptomError;

      // Load training logs
      const { data: training, error: trainingError } = await supabase
        .from('training_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', firstDayStr)
        .lte('date', lastDayStr)
        .order('date');

      if (trainingError) throw trainingError;

      // Load reminder events
      const firstDayTimestamp = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()).toISOString();
      const lastDayTimestamp = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59).toISOString();
      
      const { data: reminders, error: reminderError } = await supabase
        .from('reminder_events')
        .select('scheduled_for, status, channel')
        .eq('user_id', user?.id)
        .eq('status', 'taken')
        .gte('scheduled_for', firstDayTimestamp)
        .lte('scheduled_for', lastDayTimestamp)
        .order('scheduled_for');

      if (reminderError) throw reminderError;

      const transformedReminders = (reminders || []).map(reminder => ({
        date: reminder.scheduled_for.split('T')[0],
        status: reminder.status,
        channel: reminder.channel
      }));

      setPhaseData(phases || []);
      setCycleEvents(events || []);
      setSymptomLogs(symptoms || []);
      setTrainingLogs(training || []);
      setReminderEvents(transformedReminders);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Error loading calendar",
        description: "Failed to load your cycle data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user, currentDate, currentWeekStart, viewMode]);

  // Set selected week to the week containing today
  useEffect(() => {
    const today = new Date();
    if (today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()) {
      const weeks = getWeeksInMonth();
      const todayWeekIndex = weeks.findIndex(week => 
        week.some(date => 
          date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        )
      );
      if (todayWeekIndex !== -1) {
        setSelectedWeekIndex(todayWeekIndex);
      }
    } else {
      setSelectedWeekIndex(0);
    }
  }, [currentDate]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return 'bg-red-100 border-red-300 text-red-800';
      case 'follicular': return 'bg-green-100 border-green-300 text-green-800';
      case 'ovulatory': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'luteal': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
    } else {
      const newWeekStart = new Date(currentWeekStart);
      if (direction === 'prev') {
        newWeekStart.setDate(newWeekStart.getDate() - 7);
      } else {
        newWeekStart.setDate(newWeekStart.getDate() + 7);
      }
      setCurrentWeekStart(newWeekStart);
    }
  };

  const renderCalendarDays = () => {
    const today = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    })();
    const days = [];

    if (viewMode === 'month') {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(
          <div key={`empty-${i}`} className="aspect-square p-2 md:p-3"></div>
        );
      }

      // Add actual days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        
        const isToday = dateStr === today;
        const phaseInfo = phaseData.find(p => p.date === dateStr);
        const hasEvent = cycleEvents.some(e => e.date === dateStr);
        const symptomLog = symptomLogs.find(s => s.date === dateStr);
        const trainingLog = trainingLogs.find(t => t.date === dateStr);
        const reminderEvent = reminderEvents.find(r => r.date === dateStr);

        // Collect indicators for mobile
        const indicators = [];
        if (hasEvent) indicators.push('💧');
        if (symptomLog?.mood) indicators.push(symptomLog.mood >= 4 ? '😊' : symptomLog.mood >= 3 ? '😐' : '😔');
        if (trainingLog?.workout_types?.length) indicators.push('💪');
        if (reminderEvent) indicators.push('💊');

        days.push(
          <div
            key={dateStr}
            className={`
              aspect-square p-1 md:p-2 border border-border cursor-pointer transition-colors bg-card hover:bg-muted/50 rounded-lg relative flex flex-col items-center justify-center
              ${isToday ? 'ring-2 ring-primary' : ''}
              ${selectedDate === dateStr ? 'ring-2 ring-primary/70' : ''}
            `}
            onClick={() => {
              console.log('[Calendar] Month view - Clicked date:', dateStr, 'Current day:', currentDay.toDateString());
              setSelectedDate(dateStr);
              navigate(`/dashboard/calendar/${dateStr}`);
            }}
          >
            {/* Date number */}
            <span className="text-xs md:text-sm font-medium mb-1">{currentDay.getDate()}</span>
            
            {/* Phase color bar */}
            {phaseInfo && (
              <div 
                className={`h-0.5 w-full rounded-full mb-1 ${
                  phaseInfo.phase === 'menstrual' ? 'bg-red-400' :
                  phaseInfo.phase === 'follicular' ? 'bg-green-400' :
                  phaseInfo.phase === 'ovulatory' ? 'bg-blue-400' :
                  phaseInfo.phase === 'luteal' ? 'bg-purple-400' : 'bg-gray-400'
                }`} 
              />
            )}
            
            {/* Indicators */}
            {indicators.length > 0 && (
              <div className="flex flex-wrap gap-0.5 text-xs justify-center">
                {indicators.slice(0, 3).map((indicator, index) => (
                  <span key={index}>{indicator}</span>
                ))}
                {indicators.length > 3 && (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </div>
            )}
          </div>
        );
      }
    } else if (viewMode === 'week') {
      // Week view (7 days)
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentWeekStart.getDate() + i);
        const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        
        const isToday = dateStr === today;
        const phaseInfo = phaseData.find(p => p.date === dateStr);
        const hasEvent = cycleEvents.some(e => e.date === dateStr);
        const symptomLog = symptomLogs.find(s => s.date === dateStr);
        const trainingLog = trainingLogs.find(t => t.date === dateStr);
        const reminderEvent = reminderEvents.find(r => r.date === dateStr);

        const indicators = [];
        if (hasEvent) indicators.push('💧');
        if (symptomLog?.mood) indicators.push(symptomLog.mood >= 4 ? '😊' : symptomLog.mood >= 3 ? '😐' : '😔');
        if (trainingLog?.workout_types?.length) indicators.push('💪');
        if (reminderEvent) indicators.push('💊');

        days.push(
          <div
            key={dateStr}
            className={`
              aspect-square p-1 md:p-2 border border-border cursor-pointer transition-colors bg-card hover:bg-muted/50 rounded-lg relative flex flex-col items-center justify-center
              ${isToday ? 'ring-2 ring-primary' : ''}
              ${selectedDate === dateStr ? 'ring-2 ring-primary/70' : ''}
            `}
            onClick={() => {
              console.log('[Calendar] Week view - Clicked date:', dateStr, 'Current day:', currentDay.toDateString());
              setSelectedDate(dateStr);
              navigate(`/dashboard/calendar/${dateStr}`);
            }}
          >
            <span className="text-xs md:text-sm font-medium mb-1">{currentDay.getDate()}</span>
            
            {phaseInfo && (
              <div 
                className={`h-0.5 w-full rounded-full mb-1 ${
                  phaseInfo.phase === 'menstrual' ? 'bg-red-400' :
                  phaseInfo.phase === 'follicular' ? 'bg-green-400' :
                  phaseInfo.phase === 'ovulatory' ? 'bg-blue-400' :
                  phaseInfo.phase === 'luteal' ? 'bg-purple-400' : 'bg-gray-400'
                }`} 
              />
            )}
            
            {indicators.length > 0 && (
              <div className="flex flex-wrap gap-0.5 text-xs justify-center">
                {indicators.slice(0, 3).map((indicator, index) => (
                  <span key={index}>{indicator}</span>
                ))}
                {indicators.length > 3 && (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </div>
            )}
          </div>
        );
      }
    } else {
      // Two weeks view
      for (let i = 0; i < 14; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentWeekStart.getDate() + i);
        const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
        
        const isToday = dateStr === today;
        const phaseInfo = phaseData.find(p => p.date === dateStr);
        const hasEvent = cycleEvents.some(e => e.date === dateStr);
        const symptomLog = symptomLogs.find(s => s.date === dateStr);
        const trainingLog = trainingLogs.find(t => t.date === dateStr);
        const reminderEvent = reminderEvents.find(r => r.date === dateStr);

        const indicators = [];
        if (hasEvent) indicators.push('💧');
        if (symptomLog?.mood) indicators.push(symptomLog.mood >= 4 ? '😊' : symptomLog.mood >= 3 ? '😐' : '😔');
        if (trainingLog?.workout_types?.length) indicators.push('💪');
        if (reminderEvent) indicators.push('💊');

        days.push(
          <div
            key={dateStr}
            className={`
              aspect-square p-1 md:p-2 border border-border cursor-pointer transition-colors bg-card hover:bg-muted/50 rounded-lg relative flex flex-col items-center justify-center
              ${isToday ? 'ring-2 ring-primary' : ''}
            `}
            onClick={() => {
              console.log('[Calendar] 2-Week view - Clicked date:', dateStr, 'Current day:', currentDay.toDateString());
              setSelectedDate(dateStr);
              navigate(`/dashboard/calendar/${dateStr}`);
            }}
          >
            <span className="text-xs md:text-sm font-medium mb-1">{currentDay.getDate()}</span>
            
            {phaseInfo && (
              <div 
                className={`h-0.5 w-full rounded-full mb-1 ${
                  phaseInfo.phase === 'menstrual' ? 'bg-red-400' :
                  phaseInfo.phase === 'follicular' ? 'bg-green-400' :
                  phaseInfo.phase === 'ovulatory' ? 'bg-blue-400' :
                  phaseInfo.phase === 'luteal' ? 'bg-purple-400' : 'bg-gray-400'
                }`} 
              />
            )}
            
            {indicators.length > 0 && (
              <div className="flex flex-wrap gap-0.5 text-xs justify-center">
                {indicators.slice(0, 3).map((indicator, index) => (
                  <span key={index}>{indicator}</span>
                ))}
                {indicators.length > 3 && (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </div>
            )}
          </div>
        );
      }
    }

    console.debug('[Calendar] renderCalendarDays result', { count: days.length, viewMode, currentDate: currentDate.toISOString(), currentWeekStart: currentWeekStart.toISOString() });
    return days;
  };

  const selectedPhase = selectedDate ? phaseData.find(p => p.date === selectedDate) : null;
  const selectedEvent = selectedDate ? cycleEvents.find(e => e.date === selectedDate) : null;
  const selectedSymptom = selectedDate ? symptomLogs.find(s => s.date === selectedDate) : null;
  const selectedTraining = selectedDate ? trainingLogs.find(t => t.date === selectedDate) : null;
  const selectedReminder = selectedDate ? reminderEvents.find(r => r.date === selectedDate) : null;

  // Get all weeks in the current month
  const getWeeksInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Add empty days at the start
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyDate = new Date(firstDay);
      emptyDate.setDate(firstDay.getDate() - (firstDayOfWeek - i));
      currentWeek.push(emptyDate);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      currentWeek.push(date);
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    // Add remaining days to complete the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1];
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + 1);
        currentWeek.push(nextDate);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = getWeeksInMonth();
  const selectedWeek = weeks[selectedWeekIndex] || [];

  // Get all days for current mobile view (month or week)
  const getMobileDays = () => {
    if (mobileViewFilter === 'month') {
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const days: Date[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      }
      return days;
    } else {
      return selectedWeek.filter(d => d.getMonth() === currentDate.getMonth());
    }
  };

  const mobileDays = getMobileDays();

  // Sync carousel when day index changes
  useEffect(() => {
    if (dayCarouselApi && selectedDayIndex >= 0) {
      dayCarouselApi.scrollTo(selectedDayIndex);
    }
  }, [dayCarouselApi, selectedDayIndex]);

  // Ensure we start on today's date in mobile view
  useEffect(() => {
    if (!isMobile) return;
    const today = new Date();
    // Only if we're viewing the same month as today
    if (
      today.getMonth() !== currentDate.getMonth() ||
      today.getFullYear() !== currentDate.getFullYear()
    ) return;

    const idx = mobileDays.findIndex(
      (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    );
    if (idx !== -1 && selectedDayIndex !== idx) {
      setSelectedDayIndex(idx);
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      setSelectedDate(dateStr);
      setSelectedDayForCarousel(today);
    }
  }, [isMobile, currentDate, mobileDays, selectedDayIndex]);

  // Listen to carousel changes
  useEffect(() => {
    if (!dayCarouselApi) return;
    const onSelect = () => {
      const index = dayCarouselApi.selectedScrollSnap();
      setSelectedDayIndex(index);
      const day = mobileDays[index];
      if (day) {
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        setSelectedDate(dateStr);
      }
    };
    dayCarouselApi.on('select', onSelect);
    onSelect();
    return () => {
      dayCarouselApi.off('select', onSelect);
    };
  }, [dayCarouselApi, mobileDays]);

  // Get day data for rendering
  const getDayData = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const today = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    })();
    
    const isToday = dateStr === today;
    const phaseInfo = phaseData.find(p => p.date === dateStr);
    const hasEvent = cycleEvents.some(e => e.date === dateStr);
    const symptomLog = symptomLogs.find(s => s.date === dateStr);
    const trainingLog = trainingLogs.find(t => t.date === dateStr);
    const reminderEvent = reminderEvents.find(r => r.date === dateStr);
    
    return {
      dateStr,
      isToday,
      phaseInfo,
      hasEvent,
      symptomLog,
      trainingLog,
      reminderEvent,
    };
  };

  // Get emoji drawer data
  const emojiDrawerData = selectedDayForEmojis ? getDayData(new Date(selectedDayForEmojis)) : null;
  
  // Count emojis
  const emojiCount = emojiDrawerData ? [
    emojiDrawerData.hasEvent,
    emojiDrawerData.symptomLog?.mood,
    emojiDrawerData.trainingLog?.workout_types?.length,
    emojiDrawerData.reminderEvent
  ].filter(Boolean).length : 0;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Calendar">
        {/* Emoji Details Drawer */}
        <Sheet open={emojiDrawerOpen} onOpenChange={setEmojiDrawerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg">
                {emojiDrawerData ? new Date(selectedDayForEmojis!).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Day Details'}
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-4">
              {/* Symptoms Section */}
              {(emojiDrawerData?.hasEvent || emojiDrawerData?.symptomLog) && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Symptoms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {emojiDrawerData?.hasEvent && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-900/30">
                        <div className="text-2xl">🩸</div>
                        <span className="text-sm font-medium">Period Day</span>
                      </div>
                    )}

                    {emojiDrawerData?.symptomLog && (
                      <div className="space-y-4">
                        {/* Mood, Energy, Sleep */}
                        {(emojiDrawerData.symptomLog.mood || emojiDrawerData.symptomLog.energy || emojiDrawerData.symptomLog.sleep) && (
                          <div className="grid grid-cols-3 gap-3">
                            {emojiDrawerData.symptomLog.mood && (
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                                <span className="text-3xl">
                                  {emojiDrawerData.symptomLog.mood <= 2 ? '😢' : emojiDrawerData.symptomLog.mood === 3 ? '😐' : '😊'}
                                </span>
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground mb-0.5">Mood</p>
                                  <p className="text-sm font-semibold">{emojiDrawerData.symptomLog.mood}/5</p>
                                </div>
                              </div>
                            )}
                            {emojiDrawerData.symptomLog.energy && (
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                                <span className="text-3xl">⚡</span>
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground mb-0.5">Energy</p>
                                  <p className="text-sm font-semibold">{emojiDrawerData.symptomLog.energy}/5</p>
                                </div>
                              </div>
                            )}
                            {emojiDrawerData.symptomLog.sleep && (
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                                <span className="text-3xl">🌙</span>
                                <div className="text-center">
                                  <p className="text-xs text-muted-foreground mb-0.5">Sleep</p>
                                  <p className="text-sm font-semibold">{emojiDrawerData.symptomLog.sleep}/5</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Physical Symptoms */}
                        {(emojiDrawerData.symptomLog.cramps || emojiDrawerData.symptomLog.bloating || emojiDrawerData.symptomLog.headache || emojiDrawerData.symptomLog.breast_tenderness) && (
                          <div className="space-y-2">
                            {emojiDrawerData.symptomLog.cramps && emojiDrawerData.symptomLog.cramps > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">💢</span>
                                  <span className="text-sm font-medium">Cramps</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {emojiDrawerData.symptomLog.cramps === 1 ? 'Mild' : emojiDrawerData.symptomLog.cramps === 2 ? 'Moderate' : emojiDrawerData.symptomLog.cramps === 3 ? 'Severe' : 'Extreme'}
                                </Badge>
                              </div>
                            )}
                            {emojiDrawerData.symptomLog.bloating && emojiDrawerData.symptomLog.bloating > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">🎈</span>
                                  <span className="text-sm font-medium">Bloating</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {emojiDrawerData.symptomLog.bloating === 1 ? 'Mild' : emojiDrawerData.symptomLog.bloating === 2 ? 'Moderate' : emojiDrawerData.symptomLog.bloating === 3 ? 'Severe' : 'Extreme'}
                                </Badge>
                              </div>
                            )}
                            {emojiDrawerData.symptomLog.headache && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="text-xl">😵</span>
                                <span className="text-sm font-medium">Headache</span>
                              </div>
                            )}
                            {emojiDrawerData.symptomLog.breast_tenderness && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <span className="text-xl">🍒</span>
                                <span className="text-sm font-medium">Breast Tenderness</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cravings */}
                        {emojiDrawerData.symptomLog.craving_types && emojiDrawerData.symptomLog.craving_types.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Cravings</p>
                            <div className="flex flex-wrap gap-2">
                              {emojiDrawerData.symptomLog.craving_types.map((type, index) => {
                                const cravingEmoji = type === 'chocolate' ? '🍫' :
                                                   type === 'sweets' ? '🍭' :
                                                   type === 'salty' ? '🧂' :
                                                   type === 'carbs' ? '🍞' :
                                                   type === 'alcohol' ? '🍷' : '🍴';
                                return (
                                  <Badge key={index} variant="outline" className="px-3 py-1.5 text-sm">
                                    <span className="mr-1.5">{cravingEmoji}</span>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {emojiDrawerData.symptomLog.notes && (
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">Notes</p>
                            <p className="text-sm leading-relaxed">{emojiDrawerData.symptomLog.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Training Section */}
              {emojiDrawerData?.trainingLog && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Training
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Training Load */}
                    {emojiDrawerData.trainingLog.training_load && (
                      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                        emojiDrawerData.trainingLog.training_load === 'rest' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/30 dark:border-blue-900/30' :
                        emojiDrawerData.trainingLog.training_load === 'easy' ? 'bg-green-50/50 dark:bg-green-950/20 border-green-200/30 dark:border-green-900/30' :
                        emojiDrawerData.trainingLog.training_load === 'moderate' ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/30 dark:border-orange-900/30' :
                        'bg-red-50/50 dark:bg-red-950/20 border-red-200/30 dark:border-red-900/30'
                      }`}>
                        <span className="text-3xl">
                          {emojiDrawerData.trainingLog.training_load === 'rest' && '🛌'}
                          {emojiDrawerData.trainingLog.training_load === 'easy' && '😊'}
                          {emojiDrawerData.trainingLog.training_load === 'moderate' && '💪'}
                          {emojiDrawerData.trainingLog.training_load === 'hard' && '🔥'}
                        </span>
                        <span className="text-sm font-semibold">{emojiDrawerData.trainingLog.training_load.charAt(0).toUpperCase() + emojiDrawerData.trainingLog.training_load.slice(1)} Day</span>
                      </div>
                    )}

                    {/* Workout Types */}
                    {emojiDrawerData.trainingLog.workout_types && emojiDrawerData.trainingLog.workout_types.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Workout Types</p>
                        <div className="flex flex-wrap gap-2">
                          {emojiDrawerData.trainingLog.workout_types.map((type, index) => {
                            const workoutEmojis: Record<string, string> = {
                              'glutes': '🍑', 'legs': '🦵', 'arms': '💪', 'chest': '💪', 'shoulders': '🙆', 'back': '🦴', 'core': '👙',
                              'weightlifting': '🏋️‍♀️', 'hiit': '🔥',
                              'running': '🏃‍♀️', 'cycling': '🚴‍♀️', 'swimming': '🏊‍♀️', 'walking': '🚶‍♀️',
                              'yoga': '🧘‍♀️', 'pilates': '🧎‍♀️', 'dance': '💃',
                              'rest': '🛌', 'massage': '💆‍♀️'
                            };
                            const emoji = workoutEmojis[type] || '🏃‍♀️';
                            return (
                              <Badge key={index} variant="outline" className="px-3 py-1.5 text-sm">
                                <span className="mr-1.5">{emoji}</span>
                                {type.replace('_', ' ')}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recovery Metrics */}
                    {(emojiDrawerData.trainingLog.soreness || emojiDrawerData.trainingLog.fatigue) && (
                      <div className="grid grid-cols-2 gap-3">
                        {emojiDrawerData.trainingLog.soreness && emojiDrawerData.trainingLog.soreness > 0 && (
                          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <span className="text-3xl">💢</span>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Soreness</p>
                              <p className="text-sm font-semibold">
                                {emojiDrawerData.trainingLog.soreness === 1 ? 'Mild' : emojiDrawerData.trainingLog.soreness === 2 ? 'Moderate' : 'Severe'}
                              </p>
                            </div>
                          </div>
                        )}
                        {emojiDrawerData.trainingLog.fatigue && emojiDrawerData.trainingLog.fatigue > 0 && (
                          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <span className="text-3xl">😴</span>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-0.5">Fatigue</p>
                              <p className="text-sm font-semibold">
                                {emojiDrawerData.trainingLog.fatigue === 1 ? 'Mild' : emojiDrawerData.trainingLog.fatigue === 2 ? 'Moderate' : 'Severe'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Training Notes */}
                    {emojiDrawerData.trainingLog.notes && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Notes</p>
                        <p className="text-sm leading-relaxed">{emojiDrawerData.trainingLog.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Supplements Section */}
              {emojiDrawerData?.reminderEvent && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Supplements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/30 dark:border-purple-900/30">
                      <span className="text-2xl">💊</span>
                      <span className="text-sm font-medium">Fourmula supplement taken</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {emojiCount === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No activities logged for this day</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <div className="min-h-screen bg-background md:hidden">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Month Navigation */}
            <div className="px-4 py-4 border-b space-y-3">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 mx-2"
                    >
                      {currentDate.toLocaleDateString('en-US', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto bg-popover">
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - 6 + i);
                      return date;
                    }).map((date, index) => (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => setCurrentDate(date)}
                        className={currentDate.getMonth() === date.getMonth() && currentDate.getFullYear() === date.getFullYear() ? 'bg-accent' : ''}
                      >
                        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Week/Month Filter Toggle */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={mobileViewFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileViewFilter('week')}
                  className="flex-1"
                >
                  Week View
                </Button>
                <Button
                  variant={mobileViewFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileViewFilter('month')}
                  className="flex-1"
                >
                  Month View
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={mobileViewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileViewMode('card')}
                  className="flex-1"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Card View
                </Button>
                <Button
                  variant={mobileViewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMobileViewMode('table')}
                  className="flex-1"
                >
                  <List className="w-4 h-4 mr-2" />
                  Table View
                </Button>
              </div>
            </div>

            {/* Day Cards Carousel or Table View */}
            <div className="px-4 py-6">
              {mobileViewMode === 'card' ? (
                <Carousel setApi={setDayCarouselApi} className="w-full">
                  <CarouselContent>
                    {mobileDays.map((date, index) => {
                      const dayData = getDayData(date);
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isSelected = dayData.dateStr === selectedDate;
                      
                      return (
                        <CarouselItem key={index}>
                          <Card
                            className={`transition-all mx-2 cursor-pointer hover:shadow-lg ${
                              dayData.isToday ? 'ring-2 ring-primary/50 shadow-lg' : 'shadow-md'
                            } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                            onClick={() => {
                              setSelectedDayForEmojis(dayData.dateStr);
                              setEmojiDrawerOpen(true);
                            }}
                          >
                            <CardContent className="p-6">
                              {/* Styled Header with Gradient */}
                              <div className={`p-6 rounded-lg ${
                                dayData.phaseInfo?.phase === 'menstrual' ? 'bg-gradient-to-br from-red-50 to-red-100/50' :
                                dayData.phaseInfo?.phase === 'follicular' ? 'bg-gradient-to-br from-green-50 to-green-100/50' :
                                dayData.phaseInfo?.phase === 'ovulatory' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50' :
                                dayData.phaseInfo?.phase === 'luteal' ? 'bg-gradient-to-br from-purple-50 to-purple-100/50' :
                                'bg-gradient-to-br from-muted/30 to-muted/10'
                              }`}>
                                <div className="text-center mb-4">
                                  <p className="text-sm font-medium text-muted-foreground mb-2">
                                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                  </p>
                                  <p className="text-5xl font-bold mb-2">{date.getDate()}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                  </p>
                                </div>

                                {/* Phase Badge */}
                                {dayData.phaseInfo && (
                                  <div className="flex justify-center mb-4">
                                    <Badge 
                                      variant="secondary"
                                      className={`px-4 py-1.5 ${
                                        dayData.phaseInfo.phase === 'menstrual' ? 'bg-red-100 text-red-700 border-red-200' :
                                        dayData.phaseInfo.phase === 'follicular' ? 'bg-green-100 text-green-700 border-green-200' :
                                        dayData.phaseInfo.phase === 'ovulatory' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        dayData.phaseInfo.phase === 'luteal' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                        'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {dayData.phaseInfo.phase.charAt(0).toUpperCase() + dayData.phaseInfo.phase.slice(1)} Phase
                                    </Badge>
                                  </div>
                                )}

                                {/* Indicators Row - Always show emojis when data exists */}
                                {(dayData.hasEvent || dayData.symptomLog || dayData.trainingLog || dayData.reminderEvent) && (
                                  <div className="flex flex-wrap justify-center gap-3">
                                    {(dayData.hasEvent || dayData.symptomLog?.bleeding_flow) && (
                                      <span className="text-3xl">💧</span>
                                    )}
                                    {dayData.symptomLog && (
                                      <span className="text-3xl">
                                        {dayData.symptomLog.mood 
                                          ? (dayData.symptomLog.mood >= 4 ? '😊' : dayData.symptomLog.mood >= 3 ? '😐' : '😔')
                                          : '📝'}
                                      </span>
                                    )}
                                    {dayData.trainingLog && (
                                      <span className="text-3xl">💪</span>
                                    )}
                                    {dayData.reminderEvent && (
                                      <span className="text-3xl">💊</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div className="space-y-2">
                  {mobileDays.map((date, index) => {
                    const dayData = getDayData(date);
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    
                    // Collect indicators
                    const indicators = [];
                    if (dayData.hasEvent) indicators.push('💧');
                    if (dayData.symptomLog?.mood) {
                      indicators.push(
                        dayData.symptomLog.mood >= 4 ? '😊' : 
                        dayData.symptomLog.mood >= 3 ? '😐' : '😔'
                      );
                    }
                    if (dayData.trainingLog?.workout_types?.length) indicators.push('💪');
                    if (dayData.reminderEvent) indicators.push('💊');

                    return (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all ${
                          dayData.isToday ? 'ring-2 ring-primary' : ''
                        } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                        onClick={() => {
                          if (isCurrentMonth) {
                            navigate(`/dashboard/calendar/${dayData.dateStr}`);
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-center min-w-[60px]">
                                <p className="text-xs text-muted-foreground">
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <p className="text-2xl font-semibold">{date.getDate()}</p>
                              </div>
                              
                              {dayData.phaseInfo && (
                                <Badge 
                                  variant="outline"
                                  className={`capitalize ${
                                    dayData.phaseInfo.phase === 'menstrual' ? 'border-red-400 text-red-700' :
                                    dayData.phaseInfo.phase === 'follicular' ? 'border-green-400 text-green-700' :
                                    dayData.phaseInfo.phase === 'ovulatory' ? 'border-blue-400 text-blue-700' :
                                    dayData.phaseInfo.phase === 'luteal' ? 'border-purple-400 text-purple-700' : ''
                                  }`}
                                >
                                  {dayData.phaseInfo.phase}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {indicators.map((indicator, idx) => (
                                <span key={idx} className="text-lg">{indicator}</span>
                              ))}
                              {indicators.length === 0 && (
                                <span className="text-xs text-muted-foreground">No data</span>
                              )}
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header with View Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Cycle Calendar</h1>
                  <p className="text-muted-foreground">Track your cycle and wellness patterns</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === 'twoWeek' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('twoWeek')}
                  >
                    2 Weeks
                  </Button>
                  
                  {/* Week Selector - Only show when in week view */}
                  {viewMode === 'week' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                        >
                          Week {selectedWeekIndex + 1}
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-popover" align="end">
                        {weeks.map((week, index) => {
                          const weekStart = week[0];
                          const weekEnd = week[week.length - 1];
                          return (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => {
                                setSelectedWeekIndex(index);
                                setCurrentWeekStart(weekStart);
                              }}
                              className={selectedWeekIndex === index ? 'bg-accent' : ''}
                            >
                              Week {index + 1} ({weekStart.getDate()} - {weekEnd.getDate()})
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-200/50 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-red-700 font-medium">Current Phase</p>
                      <p className="text-2xl font-bold text-red-900 capitalize">
                        {(() => {
                          const today = new Date();
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          const currentPhase = phaseData.find(p => p.date === todayStr);
                          return currentPhase?.phase || 'Unknown';
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-200/50 flex items-center justify-center">
                        <span className="text-2xl">😊</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700 font-medium">Today's Mood</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(() => {
                          const today = new Date();
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          const todaySymptom = symptomLogs.find(s => s.date === todayStr);
                          if (todaySymptom?.mood) {
                            return todaySymptom.mood >= 4 ? 'Great' : todaySymptom.mood >= 3 ? 'Good' : 'Low';
                          }
                          return 'Not logged';
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-200/50 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-green-700 font-medium">Training This Week</p>
                      <p className="text-2xl font-bold text-green-900">
                        {(() => {
                          const now = new Date();
                          const startOfWeek = new Date(now);
                          startOfWeek.setDate(now.getDate() - now.getDay());
                          const weekTraining = trainingLogs.filter(t => {
                            const logDate = new Date(t.date);
                            return logDate >= startOfWeek && logDate <= now;
                          });
                          return weekTraining.length;
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-200/50 flex items-center justify-center">
                        <span className="text-2xl">💊</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-purple-700 font-medium">Supplements</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {(() => {
                          const now = new Date();
                          const startOfWeek = new Date(now);
                          startOfWeek.setDate(now.getDate() - now.getDay());
                          const weekReminders = reminderEvents.filter(r => {
                            const reminderDate = new Date(r.date);
                            return reminderDate >= startOfWeek && reminderDate <= now;
                          });
                          return `${weekReminders.length}/7`;
                        })()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Full Width Calendar */}
              <Card className="bg-card border border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {viewMode === 'month' 
                        ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : viewMode === 'week'
                        ? `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentWeekStart.getTime() + 13 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      }
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('prev')}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateMonth('next')}
                        className="w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="mb-4 w-full">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className={`grid gap-2 grid-cols-7 w-full`}>
                      {(() => {
                        const d = renderCalendarDays();
                        return d.length ? (
                          d
                        ) : (
                          <div className="col-span-7 text-center text-muted-foreground py-10">
                            Nothing to display yet
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-6 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1 bg-red-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Menstrual</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Follicular</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Ovulatory</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-1 bg-purple-400 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Luteal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Calendar;