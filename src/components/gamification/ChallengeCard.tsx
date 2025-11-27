import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Zap } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardEmoji: string;
  status: 'active' | 'completed';
  daysLeft?: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progressPercent = (challenge.progress / challenge.target) * 100;
  const isCompleted = challenge.status === 'completed';

  return (
    <Card className={`transition-all ${
      isCompleted 
        ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30' 
        : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`text-3xl sm:text-2xl flex-shrink-0 ${isCompleted ? 'animate-bounce' : ''}`}>
              {challenge.rewardEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">{challenge.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{challenge.description}</p>
            </div>
          </div>
          
          {isCompleted ? (
            <Badge className="bg-primary text-primary-foreground flex-shrink-0 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Done
            </Badge>
          ) : (
            challenge.daysLeft && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {challenge.daysLeft}d
              </Badge>
            )
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {challenge.progress} / {challenge.target}
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}