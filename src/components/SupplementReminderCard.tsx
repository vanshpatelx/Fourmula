import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Pill, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SupplementReminderCardProps {
  taken: boolean;
  onTaken: () => void;
}

export const SupplementReminderCard = ({ taken, onTaken }: SupplementReminderCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marking, setMarking] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  const handleMarkAsTaken = async () => {
    if (!user) return;
    
    setMarking(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Call mark-taken edge function
      const { error } = await supabase.functions.invoke('mark-taken', {
        body: { 
          user_id: user.id,
          date: today,
          taken: true
        }
      });

      if (error) throw error;

      toast({
        title: "Supplement marked! 💊",
        description: "Great job staying consistent with your routine!",
      });
      
      onTaken();
    } catch (error) {
      console.error('Error marking supplement:', error);
      toast({
        title: "Error",
        description: "Could not mark supplement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  if (taken || hidden) {
    if (hidden) return null;
    
    return (
      <Card className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl z-40 hidden md:block">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-900 text-sm">All done! ✓</h3>
              <p className="text-xs text-green-700">Supplement taken today</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHidden(true)}
                className="h-8 w-8 p-0 hover:bg-green-100"
              >
                <X className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="h-8 w-8 p-0 hover:bg-green-100"
              >
                {collapsed ? <ChevronUp className="h-4 w-4 text-green-600" /> : <ChevronDown className="h-4 w-4 text-green-600" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collapsed) {
    return (
      <Card className="fixed bottom-6 right-6 w-14 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-xl z-40 hidden md:block cursor-pointer hover:scale-105 transition-transform" onClick={() => setCollapsed(false)}>
        <CardContent className="p-3 flex items-center justify-center">
          <div className="relative">
            <Pill className="h-5 w-5 text-primary" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-xl z-40 hidden md:block">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm">Daily Supplement</h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHidden(true)}
                  className="h-6 w-6 p-0 -mt-1 hover:bg-primary/5"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollapsed(true)}
                  className="h-6 w-6 p-0 -mt-1 hover:bg-primary/5"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Have you taken your supplement today?
            </p>
            <Button
              onClick={handleMarkAsTaken}
              disabled={marking}
              className="w-full rounded-xl h-9 font-medium text-sm"
              size="sm"
            >
              <Check className="h-4 w-4 mr-2" />
              {marking ? 'Marking...' : 'Mark as Taken'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
