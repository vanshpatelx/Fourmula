import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User, Menu, Activity, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ChatSidebar } from '@/components/ChatSidebar';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ChatPromptCards } from '@/components/ChatPromptCards';
import { ActionApprovalCard } from '@/components/ActionApprovalCard';
import { RecentActivitySidebar } from '@/components/RecentActivitySidebar';
import { ChatSummaries } from '@/components/ChatSummaries';
import { useIsMobile } from '@/hooks/use-mobile';
import aiAvatar from '@/assets/ai-avatar.png';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pendingAction?: {
    type: string;
    description: string;
    details: Record<string, any>;
    toolData: any;
  };
}

const ChatContent = ({ viewMode }: { viewMode: 'chat' | 'activity' | 'summaries' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ messageId: string; action: any } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedContent, setDisplayedContent] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const loadConversationHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
      } else {
        // Add welcome message if no history
        const welcomeMessage: Message = {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your personal cycle and training coach. I'm here to help with questions about your menstrual cycle, training optimization, and wellness. How can I support you today?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        
        // Save welcome message to database
        await saveMessageToDatabase(welcomeMessage);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessageToDatabase = async (message: Message) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString()
        });

      if (error) throw error;
      
      // Trigger message count update in sidebar
      window.dispatchEvent(new CustomEvent('chat-cleared'));
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  const clearConversation = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hi! I'm your personal cycle and training coach. I'm here to help with questions about your menstrual cycle, training optimization, and wellness. How can I support you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      await saveMessageToDatabase(welcomeMessage);

      toast({
        title: "Conversation cleared",
        description: "Starting a fresh conversation",
      });
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResetChat = () => {
      clearConversation();
    };
    window.addEventListener('reset-chat', handleResetChat);
    return () => window.removeEventListener('reset-chat', handleResetChat);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConversationHistory();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
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

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessageToDatabase(userMessage);
    if (!messageText) setInput(''); // Only clear input if not from voice
    setIsLoading(true);

    try {
      // Send message to AI chat with auto-approval
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          action: 'chat',
          requireApproval: false, // Auto-approve all tool calls
          userName: displayName, // Pass user's name to AI
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      });

      if (error) {
        console.error('Chat API error:', error);
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        pendingAction: data.pending_action ? {
          type: data.pending_action.type,
          description: data.pending_action.description,
          details: data.pending_action.details,
          toolData: data.pending_action.tool_data
        } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToDatabase(assistantMessage);

      // Start typing effect with dynamic speed
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        // Skip animation for reduced motion
        setDisplayedContent(prev => ({
          ...prev,
          [assistantMessage.id]: data.message
        }));
      } else {
        setTypingMessageId(assistantMessage.id);
        const words = data.message.split(' ');
        const totalWords = words.length;
        let currentIndex = 0;
        const startTime = Date.now();
        const maxDuration = 1200; // 1.2 seconds max
        
        const typeWord = () => {
          const elapsed = Date.now() - startTime;
          
          // Force complete after max duration
          if (elapsed > maxDuration) {
            setDisplayedContent(prev => ({
              ...prev,
              [assistantMessage.id]: data.message
            }));
            setTypingMessageId(null);
            scrollToBottom();
            return;
          }
          
          if (currentIndex < totalWords) {
            setDisplayedContent(prev => ({
              ...prev,
              [assistantMessage.id]: words.slice(0, currentIndex + 1).join(' ')
            }));
            currentIndex++;
            
            // Dynamic speed: faster for longer messages
            const delay = totalWords <= 120 ? 8 : 3;
            setTimeout(typeWord, delay);
          } else {
            setTypingMessageId(null);
            scrollToBottom();
          }
        };
        
        typeWord();
      }

      // If there's a pending action, auto-execute it
      if (data.pending_action && !data.pending_action.requireApproval) {
        // Auto-execute the tool
        const executeResult = await supabase.functions.invoke('ai-chat', {
          body: {
            action: 'execute_tool',
            tool_data: data.pending_action.tool_data
          }
        });

        if (!executeResult.error) {
          // Trigger refresh
          window.dispatchEvent(new CustomEvent('cycle-data-updated'));
          
          toast({
            title: "Updated",
            description: "Your data has been logged successfully!",
          });
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approveAction = async () => {
    if (!pendingAction || !user) return;

    try {
      // Execute the approved action
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          action: 'execute_tool',
          tool_data: pendingAction.action.toolData
        }
      });

      if (error) throw error;

      setPendingAction(null);

      // Update message to remove pending action
      setMessages(prev => prev.map(msg => 
        msg.id === pendingAction.messageId 
          ? { ...msg, pendingAction: undefined }
          : msg
      ));

      // Add AI confirmation message
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Done! I've added that to your log. Is there anything else I can help you with, or would you like to chat about your cycle, training, or wellness?`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, confirmationMessage]);
      await saveMessageToDatabase(confirmationMessage);

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('cycle-data-updated'));

    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: "Error",
        description: "Failed to execute action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const rejectAction = () => {
    if (!pendingAction) return;

    setPendingAction(null);

    // Update message to remove pending action
    setMessages(prev => prev.map(msg => 
      msg.id === pendingAction.messageId 
        ? { ...msg, pendingAction: undefined }
        : msg
    ));

    // Add AI response message
    const rejectionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `No problem! I haven't made any changes. What else can I help you with?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, rejectionMessage]);
    saveMessageToDatabase(rejectionMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    // Auto-send the message
    setTimeout(() => {
      if (user) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: prompt,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        saveMessageToDatabase(userMessage);
        setInput('');
        setIsLoading(true);

        supabase.functions.invoke('ai-chat', {
          body: {
            action: 'chat',
            requireApproval: false,
            userName: displayName,
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Chat API error:', error);
            toast({
              title: "Chat Error",
              description: "Failed to get response. Please try again.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
          saveMessageToDatabase(assistantMessage);

          // Start typing effect with dynamic speed
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          
          if (prefersReducedMotion) {
            setDisplayedContent(prev => ({
              ...prev,
              [assistantMessage.id]: data.message
            }));
          } else {
            setTypingMessageId(assistantMessage.id);
            const words = data.message.split(' ');
            const totalWords = words.length;
            let currentIndex = 0;
            const startTime = Date.now();
            const maxDuration = 1200;
            
            const typeWord = () => {
              const elapsed = Date.now() - startTime;
              
              if (elapsed > maxDuration) {
                setDisplayedContent(prev => ({
                  ...prev,
                  [assistantMessage.id]: data.message
                }));
                setTypingMessageId(null);
                scrollToBottom();
                return;
              }
              
              if (currentIndex < totalWords) {
                setDisplayedContent(prev => ({
                  ...prev,
                  [assistantMessage.id]: words.slice(0, currentIndex + 1).join(' ')
                }));
                currentIndex++;
                
                const delay = totalWords <= 120 ? 8 : 3;
                setTimeout(typeWord, delay);
              } else {
                setTypingMessageId(null);
                scrollToBottom();
              }
            };
            
            typeWord();
          }

          if (data.tool_used) {
            console.log('Tool was used, refreshing calendar data');
            window.dispatchEvent(new CustomEvent('cycle-data-updated'));
            toast({
              title: "Updated",
              description: "Your data has been logged successfully!",
            });
          }
          setIsLoading(false);
        }).catch(error => {
          console.error('Chat error:', error);
          toast({
            title: "Chat Error",
            description: "Failed to get response. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        });
      }
    }, 100);
  };

  const hasUserMessages = messages.some(msg => msg.role === 'user');

  return (
    <div className="flex-1 min-w-0 grid grid-rows-[1fr,auto] h-[100dvh] md:h-screen md:overflow-hidden min-h-0">
      {viewMode === 'summaries' ? (
        <>
          {/* Mobile Header for Summaries */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-20">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <h1 className="text-sm font-semibold">Summaries</h1>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
          
          <ChatSummaries />
        </>
      ) : viewMode === 'chat' ? (
        <>
          {/* Mobile Header - Fixed at top */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-20">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src={aiAvatar} 
                alt="AI Coach" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h1 className="text-sm font-semibold">AI Coach</h1>
              </div>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Messages Container - Scrollable, takes remaining height in grid */}
          <div ref={messagesContainerRef} className="overflow-y-auto overscroll-contain md:row-start-1 min-h-0 h-full">
            {!isLoadingHistory && !hasUserMessages && (
              <div className="h-full flex items-center justify-center">
                <ChatPromptCards onSelectPrompt={handlePromptSelect} />
              </div>
            )}
            
            
            {hasUserMessages && (
              <div className="max-w-3xl mx-auto w-full px-3 md:px-6 py-4 md:py-6 pb-4 md:pb-6">
                {isLoadingHistory && (
                  <div className="flex justify-center py-8">
                    <div className="bg-muted rounded-2xl p-4 flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Loading conversation...</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 md:space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-chat-message`}
                    style={{ 
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`flex items-start gap-2 md:gap-3 ${
                      message.role === 'user' ? 'max-w-[80%] md:max-w-[85%]' : 'max-w-[85%] md:max-w-[85%]'
                    }`}>
                      {message.role === 'assistant' && (
                        <img 
                          src={aiAvatar} 
                          alt="AI Coach" 
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 mt-1"
                        />
                      )}
                      
                      <div className="flex flex-col gap-1.5 md:gap-2 flex-1">
                        <div
                          className={`rounded-2xl md:rounded-2xl px-3.5 py-2.5 md:px-6 md:py-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto rounded-br-md shadow-sm'
                              : 'bg-card border border-border/50 shadow-sm text-foreground rounded-bl-md'
                          }`}
                        >
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm md:prose-base max-w-none 
                              prose-p:leading-relaxed prose-p:my-3 prose-p:text-foreground/90
                              prose-headings:font-semibold prose-headings:text-foreground prose-headings:tracking-tight
                              prose-h1:text-lg md:prose-h1:text-xl prose-h1:mt-5 prose-h1:mb-3 prose-h1:pb-2 prose-h1:border-b prose-h1:border-border/50
                              prose-h2:text-base md:prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2.5
                              prose-h3:text-sm md:prose-h3:text-base prose-h3:mt-3 prose-h3:mb-2
                              prose-ul:my-3 prose-ul:space-y-1.5 prose-ul:pl-5
                              prose-ol:my-3 prose-ol:space-y-1.5 prose-ol:pl-5
                              prose-li:text-foreground/85 prose-li:leading-relaxed
                              prose-strong:font-semibold prose-strong:text-foreground
                              prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-primary
                              prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-3 prose-blockquote:italic
                              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="text-[14px] md:text-[15.5px] leading-relaxed">{children}</p>,
                                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                  ul: ({ children }) => <ul className="list-disc marker:text-primary/60">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal marker:text-primary/60">{children}</ol>,
                                  li: ({ children }) => <li className="text-[14px] md:text-[15px] pl-1">{children}</li>,
                                  h1: ({ children }) => <h1 className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />{children}</h1>,
                                  h2: ({ children }) => <h2>{children}</h2>,
                                  h3: ({ children }) => <h3>{children}</h3>,
                                  code: ({ children }) => <code>{children}</code>,
                                  blockquote: ({ children }) => <blockquote className="not-italic">{children}</blockquote>,
                                }}
                              >
                                {typingMessageId === message.id 
                                  ? displayedContent[message.id] || ''
                                  : message.content
                                }
                              </ReactMarkdown>
                              {typingMessageId === message.id && (
                                <span className="inline-block w-1 h-4 ml-0.5 bg-primary animate-pulse" />
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed text-[14px] md:text-[15px]">
                              {message.content}
                            </p>
                          )}
                        </div>
                            
                        {/* Show approval card if message has pending action */}
                        {message.pendingAction && pendingAction?.messageId === message.id && (
                          <ActionApprovalCard
                            action={message.pendingAction}
                            onApprove={approveAction}
                            onReject={rejectAction}
                          />
                        )}
                        
                        <span className={`text-[10px] md:text-xs text-muted-foreground/70 px-1 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                      </div>

                      {message.role === 'user' && (
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="You" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-primary"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-start gap-2 md:gap-3 max-w-[85%]">
                      <img 
                        src={aiAvatar} 
                        alt="AI Coach" 
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0"
                      />
                      <div className="bg-card border border-border/50 shadow-sm rounded-2xl rounded-bl-md px-4 py-3 md:px-6 md:py-4 flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom for desktop, relative for mobile */}
          <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm safe-area-bottom md:row-start-2 md:z-10 md:sticky md:bottom-0">
            <div className="max-w-3xl mx-auto w-full px-3 py-3 md:px-6 md:py-4">
              {/* Quick Action Buttons - Desktop only, above input */}
              {!isMobile && hasUserMessages && (
                <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => handlePromptSelect("Analyze my cycle patterns and give me personalized insights based on my data")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                  >
                    Cycle Analysis
                  </button>
                  <button
                    onClick={() => handlePromptSelect("What training should I focus on today based on my current cycle phase?")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                  >
                    Training Tips
                  </button>
                  <button
                    onClick={() => handlePromptSelect("Review my symptom logs and identify any patterns or trends I should know about")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                  >
                    Symptom Patterns
                  </button>
                  <button
                    onClick={() => handlePromptSelect("Give me personalized nutrition advice based on my current cycle phase")}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground rounded-full transition-colors"
                  >
                    Nutrition Guide
                  </button>
                </div>
              )}
              
              <div className="relative flex items-end gap-2">
                <VoiceRecorder 
                  onTranscription={(text) => {
                    sendMessage(text);
                  }}
                />
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isMobile ? "Message..." : "Ask me anything about your cycle, training, or wellness..."}
                  className="flex-1 min-h-[44px] md:min-h-[52px] max-h-[120px] md:max-h-[160px] resize-none rounded-2xl border-2 border-border focus:border-primary bg-background px-3 md:px-4 py-2.5 md:py-3.5 pr-11 md:pr-12 text-[15px] md:text-base shadow-sm transition-colors"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size={isMobile ? "default" : "lg"}
                  className="absolute right-1.5 md:right-2 bottom-1.5 md:bottom-2 h-9 w-9 md:h-10 md:w-10 rounded-xl p-0 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isMobile && (
                <p className="text-xs text-muted-foreground/70 text-center mt-2">
                  AI Coach can make mistakes. Consider checking important information.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Mobile Header for Recent Activity */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-20">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h1 className="text-sm font-semibold">Recent Activity</h1>
            </div>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
          
          <RecentActivitySidebar fullView />
        </>
      )}
    </div>
  );
};

const Chat = () => {
  const [viewMode, setViewMode] = useState<'chat' | 'activity' | 'summaries'>('chat');
  const { user } = useAuth();

  const handleClearChat = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Trigger reset without page reload
      window.dispatchEvent(new CustomEvent('reset-chat'));
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-[100dvh] md:h-screen w-full bg-background md:overflow-hidden">
          <ChatSidebar 
            onClearChat={handleClearChat}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          <ChatContent viewMode={viewMode} />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Chat;
