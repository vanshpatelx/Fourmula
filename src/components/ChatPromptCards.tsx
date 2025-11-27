import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, Heart, Brain, Apple, Target, Sparkles } from 'lucide-react';

interface ChatPromptCardsProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  {
    icon: Activity,
    title: "Cycle Analysis",
    prompt: "Analyze my cycle patterns and give me personalized insights based on my data",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    title: "Training Optimization",
    prompt: "What training should I focus on today based on my current cycle phase?",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Heart,
    title: "Symptom Patterns",
    prompt: "Review my symptom logs and identify any patterns or trends I should know about",
    gradient: "from-red-500 to-orange-500"
  },
  {
    icon: Target,
    title: "Adherence Check",
    prompt: "How is my supplement and wellness adherence trending? Give me actionable tips",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Apple,
    title: "Nutrition Guide",
    prompt: "Give me personalized nutrition advice based on my current cycle phase",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Brain,
    title: "Performance Insights",
    prompt: "Analyze my training performance across different cycle phases and identify patterns",
    gradient: "from-indigo-500 to-purple-500"
  }
];

export function ChatPromptCards({ onSelectPrompt }: ChatPromptCardsProps) {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-6">
      <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          How can I help you today?
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose a suggestion or ask anything
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {prompts.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border hover:border-primary/50 group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectPrompt(item.prompt)}
            >
              <CardContent className="p-3">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium text-foreground text-xs mb-1 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                  {item.prompt}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 text-center text-[10px] text-muted-foreground animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
        <p>💡 I can access your cycle data, training logs, symptoms, and more</p>
      </div>
    </div>
  );
}
