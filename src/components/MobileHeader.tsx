import { useState } from 'react';
import { Bell, Settings, Menu, Pill, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Logo from '@/components/Logo';
import { useNavigate, NavLink } from 'react-router-dom';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MobileHeaderProps {
  title: string;
  showSearch?: boolean;
  reminderTaken?: boolean;
  onReminderTaken?: () => void;
}

const MobileHeader = ({ title, showSearch = false, reminderTaken = false, onReminderTaken }: MobileHeaderProps) => {
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [marking, setMarking] = useState(false);

  // Using real notifications via NotificationDrawer; badge count will be computed in future
  const unreadCount = 0;

  const handleMarkAsTaken = async () => {
    if (!user || reminderTaken) return;
    
    setMarking(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
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
        description: "Great job staying consistent!",
      });
      
      onReminderTaken?.();
    } catch (error) {
      console.error('Error marking supplement:', error);
      toast({
        title: "Error",
        description: "Could not mark supplement.",
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  const allNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Calendar', path: '/dashboard/calendar', icon: '📅' },
    { label: 'Wellness Log', path: '/dashboard/symptoms', icon: '❤️' },
    { label: 'Training', path: '/dashboard/training', icon: '💪' },
    { label: 'Shop', path: '/dashboard/shop', icon: '🛍️' },
    { label: 'Education', path: '/dashboard/education', icon: '📚' },
    { label: 'Goals', path: '/dashboard/goals', icon: '🎯' },
    { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-background border-b border-border md:hidden">
        <div className="flex items-center justify-between px-4 py-0.5">
          <Logo className="w-24 h-24" showText={false} />
          
          <div className="flex items-center space-x-2">
            <div className="bg-background border border-border/30 rounded-2xl p-2 shadow-sm">
              <div className="flex items-center space-x-1">
                {!reminderTaken && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2.5 relative hover:bg-accent/50 rounded-xl transition-all duration-200"
                    onClick={handleMarkAsTaken}
                    disabled={marking}
                  >
                    <Pill className="w-4.5 h-4.5 text-primary stroke-[1.5]" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </Button>
                )}
                {reminderTaken && (
                  <div className="px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-4.5 h-4.5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white stroke-[2]" />
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2.5 relative hover:bg-accent/50 rounded-xl transition-all duration-200"
                  onClick={() => setIsNotificationDrawerOpen(true)}
                >
                  <Bell className="w-4.5 h-4.5 text-foreground/80 stroke-[1.5]" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full flex items-center justify-center border border-background">
                      <span className="text-[8px] text-primary-foreground font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2.5 hover:bg-accent/50 rounded-xl transition-all duration-200"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  <Settings className="w-4.5 h-4.5 text-foreground/80 stroke-[1.5]" />
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 bg-primary hover:bg-primary/90 rounded-xl border border-primary/20 shadow-sm transition-all duration-200"
            >
              <Menu className="w-5 h-5 text-primary-foreground stroke-[1.5]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl bg-background border-0">
          <div className="py-6 px-4">
            {/* Minimalist handle */}
            <div className="w-16 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            
            {/* Clean title */}
            <h3 className="text-lg font-light mb-8 text-center text-foreground tracking-wide">Navigation</h3>
            
            {/* Circular icon grid */}
            <div className="grid grid-cols-2 gap-6 px-2 max-w-md mx-auto">
              {allNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all duration-300 group-hover:scale-110 active:scale-95">
                    <div className="text-xl text-foreground">
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground text-center font-medium">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
            
            {/* Subtle close area */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer" 
                   onClick={() => setIsMenuOpen(false)}>
                <div className="w-3 h-0.5 bg-muted-foreground rounded-full transform rotate-45 absolute"></div>
                <div className="w-3 h-0.5 bg-muted-foreground rounded-full transform -rotate-45 absolute"></div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notification Drawer - real data */}
      <NotificationDrawer open={isNotificationDrawerOpen} onOpenChange={setIsNotificationDrawerOpen} />
    </>
  );
};

export default MobileHeader;