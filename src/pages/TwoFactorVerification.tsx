import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import Logo from '@/components/Logo';
import { ArrowLeft } from 'lucide-react';

const TwoFactorVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const stateParam = searchParams.get('state');
  let factorId = '';
  let challengeId = '';
  
  try {
    const parsedState = stateParam ? JSON.parse(decodeURIComponent(stateParam)) : null;
    factorId = parsedState?.factorId || '';
    challengeId = parsedState?.challengeId || '';
  } catch (error) {
    console.error('Error parsing state:', error);
  }

  useEffect(() => {
    // If no factorId or challengeId, redirect back to auth
    if (!factorId || !challengeId) {
      navigate('/auth');
    }
  }, [factorId, challengeId, navigate]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) return;
    
    setVerifying(true);
    
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verificationCode,
      });
      
      if (error) {
        toast({
          title: "Verification failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
        setVerificationCode('');
      } else {
        // Check if this was for disabling 2FA
        const stateParam = searchParams.get('state');
        let action = '';
        
        try {
          const parsedState = stateParam ? JSON.parse(decodeURIComponent(stateParam)) : null;
          action = parsedState?.action || '';
        } catch (error) {
          console.error('Error parsing state:', error);
        }
        
        if (action === 'disable') {
          // Disable 2FA after successful verification
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({
            factorId
          });
          
          if (unenrollError) {
            toast({
              title: "Failed to disable 2FA",
              description: "Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "2FA Disabled",
              description: "Two-factor authentication has been disabled for your account.",
            });
            navigate('/dashboard/settings');
          }
          return;
        }
        
        toast({
          title: "Success",
          description: "2FA verification successful!",
        });
        
        // Check onboarding status
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          const { data: cycleBaseline } = await supabase
            .from('cycle_baselines')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!profile || !cycleBaseline) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setVerificationCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit verification code from your authenticator app
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-8 border border-border">
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={verificationCode.length !== 6 || verifying}
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Can't access your authenticator app?{' '}
          <a href="/auth" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
