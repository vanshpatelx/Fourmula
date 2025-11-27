import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  earnedAt?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <Card className={`relative overflow-hidden transition-all active:scale-95 sm:hover:scale-105 ${
      achievement.unlocked ? 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20' : 'bg-muted/30'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`text-3xl sm:text-4xl flex-shrink-0 ${!achievement.unlocked && 'grayscale opacity-40'}`}>
            {achievement.unlocked ? achievement.emoji : '🔒'}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-semibold text-sm sm:text-base ${!achievement.unlocked && 'text-muted-foreground'}`}>
                {achievement.title}
              </h3>
              {achievement.unlocked && (
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              {achievement.description}
            </p>
            
            {achievement.unlocked && achievement.earnedAt && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {new Date(achievement.earnedAt).toLocaleDateString()}
              </Badge>
            )}
            
            {!achievement.unlocked && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}