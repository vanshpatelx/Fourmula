import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const { isInstallable, isInstalled, isIOS, isStandalone, handleInstallClick } = usePWAInstall();
  const navigate = useNavigate();

  const handleInstall = async () => {
    if (isIOS) {
      return; // iOS users need to follow manual instructions
    }
    
    const installed = await handleInstallClick();
    if (installed) {
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Install Fourmula
          </h1>
          <p className="text-muted-foreground">
            Get the full app experience on your device
          </p>
        </div>

        {(isInstalled || isStandalone) ? (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500/10">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle>Already Installed!</CardTitle>
              </div>
              <CardDescription>
                Fourmula is already installed on your device. You can access it from your home screen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Android/Chrome Install */}
            {isInstallable && !isIOS && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Quick Install</CardTitle>
                  </div>
                  <CardDescription>
                    Click the button below to install Fourmula on your device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="h-5 w-5 mr-2" />
                    Install App
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* iOS Install Instructions */}
            {isIOS && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Install on iOS</CardTitle>
                  </div>
                  <CardDescription>
                    Follow these steps to install Fourmula on your iPhone or iPad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        1
                      </div>
                      <p className="text-sm">
                        Tap the <strong>Share</strong> button in Safari (the square with an arrow pointing up)
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        2
                      </div>
                      <p className="text-sm">
                        Scroll down and tap <strong>"Add to Home Screen"</strong>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        3
                      </div>
                      <p className="text-sm">
                        Tap <strong>"Add"</strong> in the top right corner
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                      Continue to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generic Instructions */}
            {!isInstallable && !isIOS && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Browser Not Supported</CardTitle>
                  <CardDescription>
                    Your browser doesn't support app installation. Try opening this page in Chrome, Edge, or Safari.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                    Continue to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why Install?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Offline Access</p>
                <p className="text-sm text-muted-foreground">Access your cycle data even without internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Faster Performance</p>
                <p className="text-sm text-muted-foreground">Instant loading and smooth experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get reminders for supplements and training</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Home Screen Access</p>
                <p className="text-sm text-muted-foreground">Quick access just like a native app</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
