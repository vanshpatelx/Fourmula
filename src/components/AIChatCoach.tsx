import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatCoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && user && messages.length === 0) {
      loadConversationHistory();
    }
  }, [isOpen, user]);

  const callCycleTool = async (toolName: string, toolArgs?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          action: 'tool_call',
          tool_call: {
            tool_name: toolName,
            tool_args: toolArgs || {}
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        // Add success message to chat
        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ ${data.message} Your forecast has been updated!`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        await saveMessageToDatabase(successMessage);

        // Trigger calendar refresh (emit custom event)
        window.dispatchEvent(new CustomEvent('cycle-data-updated'));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Tool call error:', error);
      toast({
        title: "Action Failed",
        description: error instanceof Error ? error.message : "Failed to perform action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessageToDatabase(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to AI chat (AI will decide if tools should be called)
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          action: 'chat',
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
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToDatabase(assistantMessage);

      // If a tool was used, refresh the calendar
      if (data.tool_used) {
        console.log('Tool was used, refreshing calendar data');
        window.dispatchEvent(new CustomEvent('cycle-data-updated'));
        
        toast({
          title: "Calendar Updated",
          description: "Your cycle data has been updated successfully!",
        });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return null; // Hide chat button on desktop - supplement card replaces it
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col md:w-96 md:h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Coach</h3>
            <p className="text-xs text-muted-foreground">Cycle & Training Expert</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoadingHistory && (
            <div className="flex justify-center">
              <div className="bg-muted rounded-lg p-3 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading conversation...</span>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-chat-message`}
              style={{ 
                animationDelay: `${index * 100}ms`
              }}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/80 backdrop-blur-sm text-foreground'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-3 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-3 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        h1: ({ children }) => <h1 className="text-base font-semibold">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-semibold">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold">{children}</h3>,
                        code: ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs">{children}</code>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${
                  message.role === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground/70'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Coach is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about training, cycle syncing, symptoms..."
            className="flex-1 min-h-[40px] max-h-[80px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatCoach;