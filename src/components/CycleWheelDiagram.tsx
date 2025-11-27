import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface CycleWheelDiagramProps {
  userId: string;
  onDayClick?: (date: string) => void;
}

interface CycleBaseline {
  avg_cycle_len: number;
  luteal_len: number;
  last_period_start: string;
}

interface PhaseData {
  date: string;
  phase: string;
  confidence: number;
}

const PHASE_COLORS = {
  menstrual: { color: 'rgba(255, 255, 255, 0.95)', label: 'Menstrual' },
  follicular: { color: 'rgba(255, 255, 255, 0.75)', label: 'Follicular' },
  ovulatory: { color: 'rgba(255, 255, 255, 0.85)', label: 'Ovulatory' },
  luteal: { color: 'rgba(255, 255, 255, 0.65)', label: 'Luteal' },
};

export function CycleWheelDiagram({ userId, onDayClick }: CycleWheelDiagramProps) {
  const [baseline, setBaseline] = useState<CycleBaseline | null>(null);
  const [phaseForecasts, setPhaseForecasts] = useState<PhaseData[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCycleData();
    }
  }, [userId]);

  const loadCycleData = async () => {
    try {
      setLoading(true);

      // Fetch cycle baseline
      const { data: baselineData, error: baselineError } = await supabase
        .from('cycle_baselines')
        .select('avg_cycle_len, luteal_len, last_period_start')
        .eq('user_id', userId)
        .maybeSingle();

      if (baselineError && baselineError.code !== 'PGRST116') {
        console.error('Error loading baseline:', baselineError);
        return;
      }

      if (baselineData) {
        setBaseline(baselineData);

        // Calculate current cycle day
        const lastPeriodDate = new Date(baselineData.last_period_start);
        const today = new Date();
        const daysSinceLastPeriod = Math.floor((today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
        const cycleDay = (daysSinceLastPeriod % baselineData.avg_cycle_len) + 1;
        setCurrentDay(cycleDay);

        // Fetch phase forecasts for next 30 days
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + baselineData.avg_cycle_len);

        const { data: forecastData, error: forecastError } = await supabase
          .from('phase_forecasts')
          .select('date, phase, confidence')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (forecastError) {
          console.error('Error loading forecasts:', forecastError);
        } else if (forecastData) {
          setPhaseForecasts(forecastData);
        }
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhasesForCycle = () => {
    if (!baseline || phaseForecasts.length === 0) return [];

    const cycleLength = baseline.avg_cycle_len;
    const phases: { phase: string; startDay: number; endDay: number }[] = [];
    
    // Group consecutive days by phase
    let currentPhase = phaseForecasts[0]?.phase;
    let startDay = 1;
    
    for (let i = 1; i <= cycleLength; i++) {
      const dayPhase = phaseForecasts[i - 1]?.phase || currentPhase;
      
      if (dayPhase !== currentPhase || i === cycleLength) {
        phases.push({
          phase: currentPhase,
          startDay,
          endDay: dayPhase !== currentPhase ? i - 1 : i
        });
        
        if (dayPhase !== currentPhase) {
          currentPhase = dayPhase;
          startDay = i;
        }
      }
    }
    
    return phases;
  };

  const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);
    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const getCurrentPhase = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayForecast = phaseForecasts.find(f => f.date === today);
    return todayForecast?.phase || 'loading';
  };

  const getDaysUntilNextPeriod = () => {
    if (!baseline) return 0;
    return baseline.avg_cycle_len - currentDay + 1;
  };

  const getPhaseLabel = (phase: string) => {
    return PHASE_COLORS[phase as keyof typeof PHASE_COLORS]?.label || phase;
  };

  if (loading || !baseline) {
    return (
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="text-white/60 text-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const phases = getPhasesForCycle();
  const currentPhase = getCurrentPhase();
  const daysUntilPeriod = getDaysUntilNextPeriod();

  const progress = (currentDay / baseline.avg_cycle_len) * 100;
  const progressAngle = (currentDay / baseline.avg_cycle_len) * 360;

  return (
    <div className="relative w-full max-w-[240px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background circle - thicker */}
        <circle 
          cx="100" 
          cy="100" 
          r="85" 
          fill="none" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="18"
          strokeLinecap="round"
        />
        
        {/* Progress circle - liquid fill effect */}
        <circle 
          cx="100" 
          cy="100" 
          r="85" 
          fill="none" 
          stroke="rgba(255,255,255,0.95)" 
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 85}`}
          strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
          className="transition-all duration-700 ease-out"
        />
        
        {/* Current day dot indicator */}
        <circle 
          cx={100 + 85 * Math.cos((progressAngle - 90) * Math.PI / 180)}
          cy={100 + 85 * Math.sin((progressAngle - 90) * Math.PI / 180)}
          r="7" 
          fill="white"
          className="drop-shadow-lg"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl font-light text-white tracking-tight leading-none">
          {currentDay}
        </div>
        <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] mt-1.5 font-medium">
          Day {currentDay} of {baseline.avg_cycle_len}
        </p>
        <div className="mt-6 text-center">
          <p className="text-white text-base font-medium capitalize tracking-wide">
            {getPhaseLabel(currentPhase)}
          </p>
          {daysUntilPeriod > 0 && (
            <p className="text-white/60 text-xs mt-1.5 font-light">
              {daysUntilPeriod} days until period
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
