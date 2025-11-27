import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Target, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CustomGoal {
  id: string;
  challenge_type: string;
  target: number;
  progress: number;
  reward_emoji: string | null;
  status: string;
  metadata: {
    title: string;
    description?: string;
    is_custom: boolean;
  };
}

export function CustomGoalsOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCustomGoals();
    }
  }, [user]);

  const loadCustomGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .like('challenge_type', 'custom_%')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      const typedGoals = (data || []).map((item: any): CustomGoal => {
        const rawMetadata = item.metadata || {};
        return {
          id: item.id,
          challenge_type: item.challenge_type,
          target: item.target,
          progress: item.progress || 0,
          reward_emoji: item.reward_emoji,
          status: item.status || 'active',
          metadata: {
            title: rawMetadata?.title || 'Untitled Goal',
            description: rawMetadata?.description,
            is_custom: rawMetadata?.is_custom || true
          }
        };
      });

      setCustomGoals(typedGoals);
    } catch (error) {
      console.error('Error loading custom goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkToday = async (goal: CustomGoal) => {
    try {
      const newProgress = Math.min(goal.progress + 1, goal.target);
      const newStatus = newProgress >= goal.target ? 'completed' : 'active';
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          progress: newProgress,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', goal.id);

      if (error) throw error;
      
      if (newStatus === 'completed') {
        toast.success(`Goal completed! ${goal.reward_emoji || '🎉'}`);
      } else {
        toast.success('Marked as completed for today!');
      }
      
      loadCustomGoals();
    } catch (error) {
      console.error('Error marking today:', error);
      toast.error('Failed to mark today');
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-gray-900">My Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 sm:py-6 text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            My Goals
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard/goals')}
            className="text-xs sm:text-sm"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {customGoals.length > 0 ? (
          customGoals.map(goal => {
            const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
            
            return (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="text-lg sm:text-xl flex-shrink-0">
                    {goal.reward_emoji || '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs sm:text-sm line-clamp-1">
                      {goal.metadata.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        {goal.progress}/{goal.target}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkToday(goal)}
                  disabled={goal.progress >= goal.target}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 ml-2"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4 sm:py-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">No custom goals yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard/goals')}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
