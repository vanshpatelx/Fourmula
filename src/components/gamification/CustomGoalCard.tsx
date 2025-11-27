import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface CustomGoalCardProps {
  goal: CustomGoal;
  onUpdate: () => void;
  showDailyTracker?: boolean;
}

export function CustomGoalCard({ goal, onUpdate, showDailyTracker = false }: CustomGoalCardProps) {
  const progress = Math.min((goal.progress / goal.target) * 100, 100);
  const isCompleted = goal.status === 'completed';

  const handleMarkToday = async () => {
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
      
      onUpdate();
    } catch (error) {
      console.error('Error marking today:', error);
      toast.error('Failed to mark today');
    }
  };

  const handleIncrement = async () => {
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
        toast.success('Progress updated!');
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleDecrement = async () => {
    if (goal.progress <= 0) return;
    
    try {
      const newProgress = goal.progress - 1;
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          progress: newProgress,
          status: 'active',
          completed_at: null
        })
        .eq('id', goal.id);

      if (error) throw error;
      toast.success('Progress updated!');
      onUpdate();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', goal.id);

      if (error) throw error;
      toast.success('Goal deleted');
      onUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  return (
    <Card className={isCompleted ? 'border-primary/50 bg-primary/5' : ''}>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                  {goal.metadata.title}
                </h3>
                {isCompleted && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Done
                  </Badge>
                )}
              </div>
              {goal.metadata.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                  {goal.metadata.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{goal.reward_emoji || '🎯'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {goal.progress} / {goal.target} days
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {!isCompleted && (
            <div className="flex gap-2">
              {showDailyTracker ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkToday}
                  disabled={goal.progress >= goal.target}
                  className="flex-1"
                >
                  Mark as completed for today
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={goal.progress <= 0}
                    className="flex-1"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    -1 Day
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleIncrement}
                    disabled={goal.progress >= goal.target}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    +1 Day
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
