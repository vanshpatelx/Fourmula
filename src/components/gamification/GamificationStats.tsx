import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Award, Flame } from 'lucide-react';

interface GamificationStatsProps {
  totalEmojis: number;
  totalAchievements: number;
  currentStreak: number;
}

export function GamificationStats({ 
  totalEmojis, 
  totalAchievements, 
  currentStreak 
}: GamificationStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-4xl sm:text-3xl mb-2">🎖️</div>
          <div className="text-3xl sm:text-2xl font-bold text-foreground">{totalEmojis}</div>
          <div className="text-sm sm:text-xs text-muted-foreground mt-1">Emojis</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-4xl sm:text-3xl mb-2">🏆</div>
          <div className="text-3xl sm:text-2xl font-bold text-foreground">{totalAchievements}</div>
          <div className="text-sm sm:text-xs text-muted-foreground mt-1">Achievements</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-4xl sm:text-3xl mb-2">🔥</div>
          <div className="text-3xl sm:text-2xl font-bold text-foreground">{currentStreak}</div>
          <div className="text-sm sm:text-xs text-muted-foreground mt-1">Day Streak</div>
        </CardContent>
      </Card>
    </div>
  );
}