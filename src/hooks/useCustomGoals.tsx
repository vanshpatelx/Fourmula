import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

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

export function useCustomGoals() {
  const { user } = useAuth();
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomGoals = async () => {
    if (!user) {
      setCustomGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .like('challenge_type', 'custom_%')
        .order('created_at', { ascending: false });

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

  useEffect(() => {
    loadCustomGoals();

    const channel = supabase
      .channel('custom-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadCustomGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { customGoals, loading, refresh: loadCustomGoals };
}
