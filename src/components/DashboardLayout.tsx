import { useEffect, useState } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileHeader from "@/components/MobileHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SupplementReminderCard } from "@/components/SupplementReminderCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
}

export function DashboardLayout({ children, title = "Dashboard", showSearch = false }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [reminderTaken, setReminderTaken] = useState(false);

  const loadReminderStatus = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('adherence_logs')
      .select('taken')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    setReminderTaken(data?.taken || false);
  };

  useEffect(() => {
    loadReminderStatus();
  }, [user]);

  const handleReminderTaken = () => {
    setReminderTaken(true);
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileHeader 
          title={title} 
          showSearch={showSearch}
          reminderTaken={reminderTaken}
          onReminderTaken={handleReminderTaken}
        />
        <main className="pb-16">
          {children}
        </main>
        <MobileBottomNav />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <AppSidebar />
            <main className="flex-1">
              {children}
            </main>
            <SupplementReminderCard taken={reminderTaken} onTaken={handleReminderTaken} />
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}