import { useState, useEffect } from "react";
import { Home, Calendar, Heart, Dumbbell, BookOpen, Target, Settings, User, BarChart3, ShoppingBag, MessageSquare, LogOut } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import aiAvatar from "@/assets/ai-avatar.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Overview", url: "/dashboard/overview", icon: Home },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Wellness Log", url: "/dashboard/symptoms", icon: Heart },
  { title: "Training Log", url: "/dashboard/training", icon: Dumbbell },
  { title: "AI Coach", url: "/dashboard/chat", icon: MessageSquare },
  { title: "Shop", url: "/dashboard/shop", icon: ShoppingBag },
  { title: "Education", url: "/dashboard/education", icon: BookOpen },
  { title: "Goals", url: "/dashboard/goals", icon: Target },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.avatar_url || '');
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar
      className="w-64 bg-[#a78bfa] border-r border-purple-400 h-screen z-40 flex-shrink-0 sticky top-0"
      collapsible="none"
    >
      <SidebarContent className="py-6 h-full flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center px-5 mb-8">
          <img 
            src={aiAvatar} 
            alt="Fourmula" 
            className="w-9 h-9 rounded-2xl shadow-lg flex-shrink-0"
          />
          <div className="ml-3 flex flex-col min-w-0">
            <span className="text-xl font-semibold text-white">
              Fourmula
            </span>
            <span className="text-xs text-white/80 font-medium">Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <SidebarMenu className="space-y-2">
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    end 
                    className={({ isActive }) => `
                      flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 group w-full rounded-xl
                      ${isActive 
                        ? "bg-white/20 text-white shadow-lg" 
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0 transition-all duration-200 ${
                          isActive 
                            ? "bg-white/30 shadow-sm" 
                            : "bg-white/10 group-hover:bg-white/20"
                        }`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="truncate">{item.title}</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* User Profile at Bottom */}
        <div className="px-4 pt-4 border-t border-white/15 space-y-2">
          <NavLink 
            to="/dashboard/settings"
            className="flex items-center px-3 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="ml-3 flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {displayName || 'Profile'}
              </span>
              <span className="text-xs text-white/70">Manage account</span>
            </div>
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-3 rounded-2xl bg-white/10 hover:bg-red-500/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3 flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-white">
                Log Out
              </span>
              <span className="text-xs text-white/70">Sign out of account</span>
            </div>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}