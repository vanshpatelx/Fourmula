import { useState, useEffect } from "react";
import { MessageSquare, ArrowLeft, Trash2, User, Activity, FileText } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import aiAvatar from "@/assets/ai-avatar.png";
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface ChatSidebarProps {
  onClearChat: () => void;
  viewMode: 'chat' | 'activity' | 'summaries';
  onViewModeChange: (mode: 'chat' | 'activity' | 'summaries') => void;
}

export function ChatSidebar({ onClearChat, viewMode, onViewModeChange }: ChatSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [messageCount, setMessageCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMessageCount();
    }

    // Listen for chat clear events
    const handleChatCleared = () => {
      loadMessageCount();
    };
    
    window.addEventListener('chat-cleared', handleChatCleared);
    
    return () => {
      window.removeEventListener('chat-cleared', handleChatCleared);
    };
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

  const loadMessageCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      setMessageCount(count || 0);
    } catch (error) {
      console.error('Error loading message count:', error);
    }
  };

  const handleClearChat = async () => {
    if (!user || messageCount === 0) return;

    try {
      await onClearChat();
      setMessageCount(0);
      window.dispatchEvent(new CustomEvent('chat-cleared'));
      toast({
        title: "Chat cleared",
        description: "Your conversation has been cleared successfully.",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <Sidebar className="w-64 bg-[#a78bfa] border-r border-purple-400 h-screen flex-shrink-0 sticky top-0" collapsible="offcanvas">
      <SidebarContent className="py-6 h-full flex flex-col">
        {/* Logo Section */}
        <div className="flex items-center px-6 mb-8">
          <img 
            src={aiAvatar} 
            alt="Fourmula" 
            className="w-9 h-9 rounded-2xl shadow-lg"
          />
          <div className="ml-3 flex flex-col">
            <span className="text-xl font-bold text-white">
              Fourmula
            </span>
            <span className="text-xs text-white/80 font-medium">AI Coach</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 mb-6 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => navigate('/dashboard/overview')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Button
            onClick={handleClearChat}
            className="w-full gap-2 bg-white/20 hover:bg-white/30 text-white rounded-xl shadow-lg disabled:opacity-50"
            disabled={messageCount === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </Button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="flex flex-col gap-2 mb-4">
            <Button
              variant="ghost"
              className={`w-full justify-start rounded-xl ${
                viewMode === 'chat' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onViewModeChange('chat')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start rounded-xl ${
                viewMode === 'summaries' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onViewModeChange('summaries')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Summaries
            </Button>
            <Button
              variant="ghost"
              className={`w-full justify-start rounded-xl ${
                viewMode === 'activity' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => onViewModeChange('activity')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Recent Activity
            </Button>
          </div>

          {viewMode === 'chat' && (
            <div className="px-2 py-4">
              <div className="text-xs text-white/60 mb-2">
                Current Chat
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3">
                <MessageSquare className="w-4 h-4 text-white/80 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white">
                    Active Conversation
                  </div>
                  <div className="text-xs text-white/60">
                    {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile at Bottom */}
        <div className="px-4 pt-4 border-t border-white/15">
          <NavLink 
            to="/dashboard/settings"
            className="flex items-center px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
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
            <div className="ml-3 flex flex-col">
              <span className="text-sm font-semibold text-white">
                {displayName || 'Profile'}
              </span>
              <span className="text-xs text-white/70">Manage account</span>
            </div>
          </NavLink>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
