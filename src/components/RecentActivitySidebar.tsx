import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, Dumbbell, Heart, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  details?: any;
}

interface RecentActivitySidebarProps {
  fullView?: boolean;
}

export function RecentActivitySidebar({ fullView = false }: RecentActivitySidebarProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivities();
    }
  }, [user]);

  const loadRecentActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch recent cycle events
      const { data: cycleEvents } = await supabase
        .from('cycle_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent training logs
      const { data: trainingLogs } = await supabase
        .from('training_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent symptom logs
      const { data: symptomLogs } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(5);

      const allActivities: ActivityLog[] = [];

      cycleEvents?.forEach(event => {
        allActivities.push({
          id: event.id,
          type: 'cycle',
          description: `${event.type === 'period_start' ? 'Period started' : event.type === 'period_end' ? 'Period ended' : 'Ovulation logged'}`,
          timestamp: new Date(event.created_at),
          details: event
        });
      });

      trainingLogs?.forEach(log => {
        allActivities.push({
          id: log.id,
          type: 'training',
          description: `${log.workout_types?.join(', ')} training logged`,
          timestamp: new Date(log.created_at),
          details: log
        });
      });

      symptomLogs?.forEach(log => {
        allActivities.push({
          id: log.id,
          type: 'symptom',
          description: log.notes || 'Wellness data logged',
          timestamp: new Date(log.date),
          details: log
        });
      });

      // Sort all activities by timestamp
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cycle':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'training':
        return <Dumbbell className="w-4 h-4 text-blue-500" />;
      case 'symptom':
        return <Heart className="w-4 h-4 text-pink-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (fullView) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Recent Activity</h1>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No recent activity in the last 7 days
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{activity.description}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {activity.details && (
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground space-y-1 pl-11">
                        {activity.type === 'training' && (
                          <>
                            {activity.details.notes && <p>Notes: {activity.details.notes}</p>}
                            {activity.details.training_load && <p>Load: {activity.details.training_load}</p>}
                          </>
                        )}
                        {activity.type === 'symptom' && (
                          <>
                            {activity.details.mood && <p>Mood: {activity.details.mood}/10</p>}
                            {activity.details.energy && <p>Energy: {activity.details.energy}/10</p>}
                          </>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0">
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="text-xs text-white/60 py-4">Loading...</div>
          ) : activities.length === 0 ? (
            <div className="text-xs text-white/60 py-4">No recent activity</div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white line-clamp-2">{activity.description}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
