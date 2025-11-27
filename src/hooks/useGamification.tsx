import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  earnedAt?: string;
  type: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardEmoji: string;
  status: 'active' | 'completed';
  daysLeft?: number;
  type: string;
}

const ACHIEVEMENT_DEFINITIONS = [
  { type: 'first_week', title: 'First Week!', description: 'Complete your first week', emoji: '🌟' },
  { type: 'perfect_week', title: 'Perfect Week', description: 'Take supplements every day for a week', emoji: '✨' },
  { type: 'month_champion', title: 'Monthly Champion', description: '30 days of consistency', emoji: '👑' },
  { type: 'early_bird', title: 'Early Bird', description: 'Log before 8 AM for 5 days', emoji: '🌅' },
  { type: 'streak_master', title: 'Streak Master', description: 'Maintain a 14-day streak', emoji: '🔥' },
  { type: 'workout_warrior', title: 'Workout Warrior', description: 'Complete 12 training sessions', emoji: '💪' },
];

const CHALLENGE_DEFINITIONS = [
  { type: '7_day_challenge', title: '7 Day Streak', description: 'Take supplements for 7 days straight', target: 7, emoji: '🎯', days: 7 },
  { type: 'training_week', title: 'Training Week', description: 'Log 5 training sessions this week', target: 5, emoji: '🏋️', days: 7 },
  { type: 'consistency_month', title: 'Consistency Month', description: 'Complete 25 out of 30 days', target: 25, emoji: '📅', days: 30 },
  { type: 'early_riser', title: 'Early Riser', description: 'Log before 8 AM for 5 days', target: 5, emoji: '🌅', days: 7 },
  { type: 'training_month', title: 'Training Month', description: 'Complete 12 workouts in 30 days', target: 12, emoji: '💪', days: 30 },
  { type: 'perfect_fortnight', title: 'Perfect Fortnight', description: 'Take supplements every day for 14 days', target: 14, emoji: '✨', days: 14 },
];

export function useGamification() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  // Set up real-time subscription to refresh data when changes occur
  useEffect(() => {
    if (!user) return;

    const achievementsChannel = supabase
      .channel('achievements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` },
        () => loadGamificationData()
      )
      .subscribe();

    const challengesChannel = supabase
      .channel('challenges-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'challenges', filter: `user_id=eq.${user.id}` },
        () => loadGamificationData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(challengesChannel);
    };
  }, [user]);

  const loadGamificationData = async () => {
    try {
      // Load achievements
      const { data: earnedAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);

      const achievementsList = ACHIEVEMENT_DEFINITIONS.map(def => {
        const earned = earnedAchievements?.find(a => a.achievement_type === def.type);
        return {
          id: earned?.id || def.type,
          title: def.title,
          description: def.description,
          emoji: def.emoji,
          unlocked: !!earned,
          earnedAt: earned?.earned_at,
          type: def.type,
        };
      });

      setAchievements(achievementsList);

      // Load challenges
      const { data: userChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['active', 'completed']);

      // Deduplicate challenges by type (safety measure)
      const uniqueChallenges = userChallenges?.reduce((acc, c) => {
        if (!acc.find(ch => ch.challenge_type === c.challenge_type)) {
          acc.push(c);
        }
        return acc;
      }, [] as typeof userChallenges) || [];

      // If no challenges exist or user has fewer than 6 active, create/refresh challenges
      const activeChallenges = uniqueChallenges.filter(c => c.status === 'active');
      if (uniqueChallenges.length === 0 || activeChallenges.length < 6) {
        await initializeChallenges();
      } else {
        const challengesList = uniqueChallenges.map(c => {
          const def = CHALLENGE_DEFINITIONS.find(d => d.type === c.challenge_type);
          const startDate = new Date(c.started_at);
          const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const daysLeft = def ? Math.max(0, def.days - daysElapsed) : undefined;

          // Check if this is a custom goal (challenge_type starts with "custom_")
          const isCustomGoal = c.challenge_type.startsWith('custom_');
          const metadata = (c.metadata as any) || {};

          return {
            id: c.id,
            title: isCustomGoal ? (metadata.title || 'Custom Goal') : (def?.title || c.challenge_type),
            description: isCustomGoal ? (metadata.description || '') : (def?.description || ''),
            progress: c.progress,
            target: c.target,
            rewardEmoji: c.reward_emoji || def?.emoji || '🎁',
            status: c.status as 'active' | 'completed',
            daysLeft,
            type: c.challenge_type,
          };
        });

        setChallenges(challengesList);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setLoading(false);
    }
  };

  const initializeChallenges = async () => {
    if (!user) return;

    // Get existing challenges
    const { data: existing } = await supabase
      .from('challenges')
      .select('challenge_type, status')
      .eq('user_id', user.id);

    const existingTypes = existing?.map(c => c.challenge_type) || [];
    const activeChallenges = existing?.filter(c => c.status === 'active') || [];

    // Only create challenges that don't exist
    const newChallenges = CHALLENGE_DEFINITIONS
      .filter(def => !existingTypes.includes(def.type))
      .map(def => ({
        user_id: user.id,
        challenge_type: def.type,
        status: 'active',
        progress: 0,
        target: def.target,
        reward_emoji: def.emoji,
      }));

    if (newChallenges.length > 0) {
      const { error } = await supabase
        .from('challenges')
        .insert(newChallenges);

      if (!error) {
        loadGamificationData();
      }
    }
  };

  const updateChallengeProgress = async (challengeType: string, newProgress: number) => {
    if (!user) return;

    const challenge = challenges.find(c => c.type === challengeType);
    if (!challenge) return;

    const status = newProgress >= challenge.target ? 'completed' : 'active';

    const { error } = await supabase
      .from('challenges')
      .update({ 
        progress: newProgress, 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null 
      })
      .eq('id', challenge.id);

    if (!error) {
      if (status === 'completed') {
        // Award achievement
        await unlockAchievement(challengeType);
      }
      loadGamificationData();
    }
  };

  const unlockAchievement = async (achievementType: string) => {
    if (!user) return;

    const achievement = achievements.find(a => a.type === achievementType);
    if (!achievement || achievement.unlocked) return;

    const { error } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        achievement_type: achievementType,
      });

    if (!error) {
      loadGamificationData();
    }
  };

  const stats = {
    totalEmojis: achievements.filter(a => a.unlocked).length,
    totalAchievements: achievements.filter(a => a.unlocked).length,
    currentStreak: 0, // This should come from adherence logs
  };

  return {
    achievements,
    challenges,
    stats,
    loading,
    updateChallengeProgress,
    unlockAchievement,
  };
}