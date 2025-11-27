import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Dumbbell, TrendingUp, Settings, Bell, LogOut, Search, Plus, Scale, Droplets, Video, FileText, Activity, Apple, Stethoscope, Brain, Utensils, Target, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { CycleWheelDiagram } from '@/components/CycleWheelDiagram';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { useNotifications } from '@/hooks/useNotifications';
import { CustomGoalsOverview } from '@/components/dashboard/CustomGoalsOverview';
interface Profile {
  display_name?: string;
  birth_year?: number;
  region?: string;
}
interface WeeklyWinsGoal {
  target_days: number;
  target_streak: number;
  training_goal_days: number;
}
interface PhaseData {
  phase: string;
  confidence: number;
}
interface WeeklyWinsData {
  current_streak: number;
  days_this_week: number;
  training_days_this_week: number;
}
const Dashboard = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayPhase, setTodayPhase] = useState<PhaseData | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [goal, setGoal] = useState<WeeklyWinsGoal | null>(null);
  const [weeklyWins, setWeeklyWins] = useState<WeeklyWinsData | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Enable daily supplement reminders
  useNotifications();
  useEffect(() => {
    if (user) {
      loadUserData();
      loadTodayPhase();
      loadStreakCount();
      loadGoal();
      loadWeeklyWinsData();
    }
  }, [user]);
  const loadUserData = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('display_name, birth_year, region').eq('user_id', user.id).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  const loadTodayPhase = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const {
        data,
        error
      } = await supabase.from('phase_forecasts').select('phase, confidence').eq('user_id', user.id).eq('date', today).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading today phase:', error);
        return;
      }

      // If no forecast found, try to rebuild
      if (!data) {
        console.log('No forecast found, attempting rebuild...');
        const {
          error: rebuildError
        } = await supabase.functions.invoke('rebuild-forecast', {
          body: {
            user_id: user.id
          }
        });
        if (!rebuildError) {
          // Retry loading after rebuild
          const {
            data: retryData
          } = await supabase.from('phase_forecasts').select('phase, confidence').eq('user_id', user.id).eq('date', today).maybeSingle();
          setTodayPhase(retryData);
        } else {
          console.error('Rebuild forecast error:', rebuildError);
        }
      } else {
        setTodayPhase(data);
      }
    } catch (error) {
      console.error('Error loading today phase:', error);
    }
  };
  const loadStreakCount = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if supplement was taken today
      const {
        data,
        error
      } = await supabase.from('adherence_logs').select('taken, streak_count').eq('user_id', user.id).eq('date', today).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading streak count:', error);
        return;
      }
      setStreakCount(data?.streak_count || 0);
    } catch (error) {
      console.error('Error loading streak count:', error);
    }
  };
  const loadGoal = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('adherence_goals').select('target_days, target_streak, training_goal_days').eq('user_id', user.id).eq('active', true).maybeSingle();
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading goal:', error);
        return;
      }
      setGoal(data);
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };
  const loadWeeklyWinsData = async () => {
    if (!user) return;
    try {
      // Calculate from available data
      const {
        data: trainingLogs,
        error: trainingError
      } = await supabase.from('training_logs').select('date').eq('user_id', user.id);

      // Get start of current week (Sunday)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const trainingDaysThisWeek = trainingLogs?.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfWeek;
      }).length || 0;
      setWeeklyWins({
        current_streak: 0,
        // Will be calculated once adherence_logs is properly set up
        days_this_week: 0,
        // Will be calculated once adherence_logs is properly set up
        training_days_this_week: trainingDaysThisWeek
      });
    } catch (error) {
      console.error('Error loading weekly wins:', error);
    }
  };
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'follicular':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ovulatory':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'luteal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'Time for rest and reflection';
      case 'follicular':
        return 'Energy building phase - great for new projects';
      case 'ovulatory':
        return 'Peak energy and fertility window';
      case 'luteal':
        return 'Pre-menstrual phase - time for reflection';
      default:
        return 'Getting to know your cycle';
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  return <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        <div className="flex-1 bg-gray-50 overflow-auto">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="p-4">
              <div className="grid gap-4 mb-6">
                {/* Cycle Tracker */}
                <Card className="gradient-bg text-white border-0 min-h-[420px]">
                  <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                    <div className="mb-8">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}</span>
                      </div>
                    </div>
                    
                    {user && <CycleWheelDiagram userId={user.id} />}
                  </CardContent>
                </Card>
              </div>

              {/* Mobile specific sections */}
              <div className="grid gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">How are you feeling today</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-purple-100 to-blue-100 border-0 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-purple-600" />
                        </div>
                        <Plus className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">Share Your Day</h3>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-0 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-pink-600" />
                        </div>
                        <Plus className="w-4 h-4 text-pink-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">Daily Insight</h3>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Other mobile sections... */}
              <div className="grid gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Other Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/symptoms')}>
                    <CardContent className="p-4 text-center">
                      <Scale className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Weight</p>
                      <p className="text-xs text-gray-500">Track in Wellness</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-cyan-100 to-blue-100 border-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/dashboard/symptoms')}>
                    <CardContent className="p-4 text-center">
                      <Droplets className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Water</p>
                      <p className="text-xs text-gray-500">Track in Wellness</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            {/* Desktop Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-medium text-gray-600">
                  Good Morning, <span className="text-gray-900 font-semibold">{profile?.display_name || 'User'}!</span>
                </h1>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => setNotificationDrawerOpen(true)} className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                  </Button>
                  <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 w-64">
                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                    <input type="text" placeholder="Search" className="bg-transparent outline-none text-sm text-gray-600 w-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Desktop Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {/* Quick Stats */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {todayPhase?.phase ? todayPhase.phase.charAt(0).toUpperCase() + todayPhase.phase.slice(1) : 'Unknown'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">Current Phase</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {weeklyWins?.training_days_this_week || 0}/{goal?.training_goal_days || 5}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">Training Days</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{streakCount}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Day Streak</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {weeklyWins?.days_this_week || 0}/{goal?.target_days || 7}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">Wellness Days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Left Column - Cycle Tracker */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <Card className="gradient-bg text-white border-0 h-80 sm:h-96 mb-4 sm:mb-6">
                    <CardContent className="p-6 sm:p-8 lg:p-10 h-full flex flex-col items-center justify-center">
                      <div className="mb-6 sm:mb-8 lg:mb-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-2.5" />
                          <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}</span>
                        </div>
                      </div>
                      
                      {user && <CycleWheelDiagram userId={user.id} />}
                    </CardContent>
                  </Card>

                  {/* Action Cards */}
                  
                </div>

                {/* Right Column - Custom Goals */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Custom Goals Overview */}
                  <CustomGoalsOverview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
      
      <NotificationDrawer open={notificationDrawerOpen} onOpenChange={setNotificationDrawerOpen} />
    </ProtectedRoute>;
};
export default Dashboard;