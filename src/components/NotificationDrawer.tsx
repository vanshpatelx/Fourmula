import { useState, useEffect } from 'react';
import { Bell, X, Calendar, CheckCircle2, Info } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'reminder' | 'info' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationDrawer = ({ open, onOpenChange }: NotificationDrawerProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && open) {
      loadNotifications();
    }
  }, [user, open]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load real reminder events from database
      const { data: reminders } = await supabase
        .from('reminder_events')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: false })
        .limit(20);

      const notifs: Notification[] = [];

      // Add reminders from database
      if (reminders) {
        reminders.forEach((reminder) => {
          const isReminder = reminder.status === 'sent';
          const isTaken = reminder.status === 'taken';
          
          notifs.push({
            id: reminder.id,
            type: isTaken ? 'achievement' : 'reminder',
            title: isTaken ? '✅ Supplement Taken' : '💊 Supplement Reminder',
            message: isTaken 
              ? 'You took your supplement. Great job staying consistent!' 
              : 'Time to take your daily Fourmula supplement',
            timestamp: new Date(reminder.scheduled_for),
            read: isTaken,
          });
        });
      }

      setNotifications(notifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Calendar className="w-5 h-5 text-primary" />;
      case 'achievement':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Notifications</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </SheetDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="mt-2"
            >
              Mark all as read
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.read
                      ? 'bg-background border-border'
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="default" className="flex-shrink-0 h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
