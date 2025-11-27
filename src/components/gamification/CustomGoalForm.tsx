import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CustomGoalForm({ onGoalCreated }: { onGoalCreated: () => void }) {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDays, setTargetDays] = useState(7);
  const [emoji, setEmoji] = useState('🎯');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('challenges').insert({
        user_id: user.id,
        challenge_type: `custom_${Date.now()}`,
        target: targetDays,
        progress: 0,
        status: 'active',
        reward_emoji: emoji,
        started_at: new Date().toISOString(),
        metadata: {
          title,
          description,
          is_custom: true
        }
      });

      if (error) throw error;

      toast.success('Goal created successfully!');
      setTitle('');
      setDescription('');
      setTargetDays(7);
      setEmoji('🎯');
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-medium">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Create New Goal
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Set your own custom challenge
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., No sugar for 10 days"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Days</Label>
              <Input
                id="target"
                type="number"
                min="1"
                max="365"
                value={targetDays}
                onChange={(e) => setTargetDays(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emoji">Reward Emoji</Label>
              <Input
                id="emoji"
                placeholder="🎯"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
              />
            </div>
          </div>

          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? 'Creating...' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
