import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export const VoiceRecorder = ({ onTranscription }: VoiceRecorderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimTranscription, setInterimTranscription] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setTranscription(prev => prev + final);
        }
        setInterimTranscription(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice recording.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current?.start();
        }
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      recognitionRef.current?.stop();
    };
  }, [isRecording, toast]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTranscription('');
      setInterimTranscription('');
      setIsRecording(true);
      setRecordingTime(0);
      
      recognitionRef.current.start();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Recognition Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setInterimTranscription('');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    const finalText = transcription.trim();
    
    if (!finalText) {
      toast({
        title: "No Transcription",
        description: "Please record some audio before sending.",
        variant: "destructive",
      });
      return;
    }

    onTranscription(finalText);
    handleClose();
    
    toast({
      title: "Message Sent",
      description: "Your voice message has been sent.",
    });
  };

  const handleClose = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsOpen(false);
    setTranscription('');
    setInterimTranscription('');
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="hover:bg-primary/10"
      >
        <Mic className="w-5 h-5 text-muted-foreground hover:text-primary" />
      </Button>

      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="flex flex-col p-0 max-h-[85vh]">
          <DrawerHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DrawerTitle className="flex items-center justify-between">
              <span>Voice Recording</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Microphone Control Section */}
            <div className="px-6 py-6 border-b border-border">
              <div className="flex flex-col items-center gap-4">
                {/* Microphone Button */}
                <div className={`relative ${isRecording ? 'animate-pulse' : ''}`}>
                  <Button
                    onClick={startRecording}
                    size="lg"
                    disabled={isRecording}
                    className="w-20 h-20 rounded-full"
                  >
                    <Mic className="w-8 h-8" />
                  </Button>
                  
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
                  )}
                </div>

                {/* Recording Time */}
                {isRecording && (
                  <div className="text-xl font-mono font-bold text-foreground">
                    {formatTime(recordingTime)}
                  </div>
                )}

                {/* Status Text */}
                <p className="text-sm text-muted-foreground text-center">
                  {isRecording 
                    ? "Listening... Speak clearly"
                    : transcription
                    ? "Review your transcription below"
                    : "Press the microphone to start"}
                </p>

                {/* Stop Button - Only visible when recording */}
                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="w-full max-w-xs gap-2"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </div>

            {/* Transcription Display */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Transcription
                </label>
                <Textarea
                  value={transcription + interimTranscription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Your speech will appear here in real-time..."
                  className="min-h-[200px] resize-none bg-muted/50"
                  disabled={isRecording}
                />
                {interimTranscription && (
                  <p className="text-xs text-muted-foreground italic">
                    Still listening...
                  </p>
                )}
              </div>
            </div>

            {/* Send Button */}
            <div className="px-6 py-4 border-t border-border">
              <Button
                onClick={handleSend}
                disabled={!transcription.trim() || isRecording}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-5 h-5" />
                Send Message
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
