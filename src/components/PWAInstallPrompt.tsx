import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

export const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Show prompt after 3 seconds if installable
    const timer = setTimeout(() => {
      if ((isInstallable || isIOS) && !isInstalled && !isStandalone) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS, isStandalone]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIOS) {
      // For iOS, just show the prompt longer
      return;
    }
    
    const installed = await handleInstallClick();
    if (installed) {
      setShowPrompt(false);
    }
  };

  // Don't show if dismissed, installed, or in standalone mode
  if (isDismissed || isInstalled || isStandalone || !showPrompt) {
    return null;
  }

  // Don't show if not installable (unless iOS)
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-lg backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">Install Fourmula App</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isIOS 
                      ? 'Tap Share → Add to Home Screen for the best experience'
                      : 'Install our app for offline access and faster performance'
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!isIOS && (
                <Button 
                  onClick={handleInstall}
                  size="sm"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
