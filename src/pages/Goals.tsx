import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '@/hooks/useGamification';
import { GamificationStats } from '@/components/gamification/GamificationStats';
import { AchievementCard } from '@/components/gamification/AchievementCard';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { useCustomGoals } from '@/hooks/useCustomGoals';
import { GoalsTabContent } from '@/components/gamification/GoalsTabContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Goals = () => {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);

  const { achievements, challenges, stats, loading: gamificationLoading } = useGamification();
  const { customGoals, loading: customGoalsLoading, refresh: refreshCustomGoals } = useCustomGoals();

  useEffect(() => {
    if (user) {
      loadCurrentStreak();
    }
  }, [user]);

  const loadCurrentStreak = async () => {
    try {
      const { data } = await supabase
        .from('adherence_logs')
        .select('streak_count')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCurrentStreak(data.streak_count);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Goals & Achievements">
        <div className="flex-1 bg-background overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  Goals
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Track progress & earn rewards</p>
              </div>
            </div>

            {/* Gamification Stats */}
            <GamificationStats 
              totalEmojis={stats.totalEmojis}
              totalAchievements={stats.totalAchievements}
              currentStreak={currentStreak}
            />

            {/* Tabs for Goals and Achievements */}
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="goals" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <GoalsTabContent 
                  challenges={challenges}
                  customGoals={customGoals}
                  gamificationLoading={gamificationLoading}
                  customGoalsLoading={customGoalsLoading}
                  onRefreshCustomGoals={refreshCustomGoals}
                />
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-medium">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Unlock achievements as you progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {gamificationLoading ? (
                        <div className="col-span-2 text-center py-8 text-sm text-muted-foreground">Loading...</div>
                      ) : (
                        achievements.map(achievement => (
                          <AchievementCard key={achievement.id} achievement={achievement} />
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Goals;