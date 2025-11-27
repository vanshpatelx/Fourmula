import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Plus, Filter } from 'lucide-react';
import { ChallengeCard } from './ChallengeCard';
import { CustomGoalCard } from './CustomGoalCard';
import { CustomGoalForm } from './CustomGoalForm';
import { Challenge } from '@/hooks/useGamification';

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

interface GoalsTabContentProps {
  challenges: Challenge[];
  customGoals: CustomGoal[];
  gamificationLoading: boolean;
  customGoalsLoading: boolean;
  onRefreshCustomGoals: () => void;
}

type FilterType = 'all' | 'preset' | 'custom';

export function GoalsTabContent({
  challenges,
  customGoals,
  gamificationLoading,
  customGoalsLoading,
  onRefreshCustomGoals
}: GoalsTabContentProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter preset challenges (not starting with "custom_")
  const presetChallenges = challenges.filter(c => !c.type.startsWith('custom_'));
  
  // Filter custom challenges (starting with "custom_")
  const customChallenges = challenges.filter(c => c.type.startsWith('custom_'));

  const displayedChallenges = filter === 'preset' 
    ? presetChallenges 
    : filter === 'custom' 
    ? customChallenges 
    : challenges;

  const handleGoalCreated = () => {
    onRefreshCustomGoals();
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter and Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button
            variant={filter === 'preset' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('preset')}
            className="text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Preset
          </Button>
          <Button
            variant={filter === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('custom')}
            className="text-xs"
          >
            <Target className="w-3 h-3 mr-1" />
            Custom
          </Button>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          New Goal
        </Button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <CustomGoalForm onGoalCreated={handleGoalCreated} />
      )}

      {/* Goals List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-medium">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {filter === 'preset' ? 'Preset Goals' : filter === 'custom' ? 'My Custom Goals' : 'All Goals'}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filter === 'custom' 
              ? 'Track your personal challenges' 
              : filter === 'preset'
              ? 'Complete preset challenges to earn rewards'
              : 'Track all your goals and challenges'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {(gamificationLoading || customGoalsLoading) ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading...</div>
          ) : displayedChallenges.length > 0 ? (
            displayedChallenges.map(challenge => {
              const isCustom = challenge.type.startsWith('custom_');
              if (isCustom) {
                const customGoal = customGoals.find(g => g.challenge_type === challenge.type);
                if (customGoal) {
                  return (
                    <CustomGoalCard 
                      key={challenge.id} 
                      goal={customGoal} 
                      onUpdate={onRefreshCustomGoals}
                      showDailyTracker={true}
                    />
                  );
                }
              }
              return <ChallengeCard key={challenge.id} challenge={challenge} />;
            })
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {filter === 'custom' 
                ? 'No custom goals yet. Click "New Goal" to create one!'
                : 'No goals found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
