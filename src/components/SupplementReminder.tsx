import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Pill, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupplementReminderProps {
  onClose: () => void;
  onTaken: () => void;
  phase?: 'A' | 'B' | null;
}

export const SupplementReminder = ({ onClose, onTaken, phase }: SupplementReminderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marking, setMarking] = useState(false);

  const handleMarkAsTaken = async () => {
    if (!user) return;

    setMarking(true);
    try {
      const { data, error } = await supabase.functions.invoke('mark-taken', {
        body: { user_id: user.id, taken_at: new Date().toISOString() }
      });

      if (error) throw error;

      toast({
        title: "Supplement logged! 💊",
        description: `Great job! Current streak: ${data.streak_days || 1} days`,
      });

      onTaken();
      onClose();
    } catch (error) {
      console.error('Error marking supplement as taken:', error);
      toast({
        title: "Error",
        description: "Failed to log supplement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 animate-in slide-in-from-bottom-5">
      <Card className="w-80 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Supplement Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  {phase === 'A' 
                    ? 'Phase A (Follicular + Ovulatory) - Morning supplement'
                    : phase === 'B'
                    ? 'Phase B (Luteal + Menstrual) - Evening supplement'
                    : 'Time to take your Fourmula'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleMarkAsTaken}
              disabled={marking}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {marking ? 'Logging...' : 'Mark as Taken'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Remind Me Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
