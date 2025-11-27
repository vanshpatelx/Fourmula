import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import { SignInPage } from '@/components/ui/sign-in';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/auth-hero-premium.jpg';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [checking2FA, setChecking2FA] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && !checking2FA) {
        try {
          // Check if email is confirmed - if not, sign out and don't proceed
          if (!user.email_confirmed_at) {
            console.log('Email not confirmed, signing out');
            await supabase.auth.signOut();
            toast({
              title: "Email verification required",
              description: "Please check your email and click the confirmation link to continue.",
            });
            return;
          }

          // First check if 2FA is enabled and needs verification
          const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
          
          // If we get an error about user not existing, clear the session
          if (factorsError && factorsError.message.includes('User from sub claim in JWT does not exist')) {
            await supabase.auth.signOut();
            return;
          }
          
          if (factors && factors.totp && factors.totp.length > 0) {
            const verifiedFactor = factors.totp.find(f => f.status === 'verified');
            
            if (verifiedFactor) {
              // Check if we need to verify (assurance level is not aal2)
              const { data: { session } } = await supabase.auth.getSession();
              
              if (session && (session as any).aal !== 'aal2') {
                // Need to verify 2FA - redirect to 2FA page
                const { data: challenge } = await supabase.auth.mfa.challenge({
                  factorId: verifiedFactor.id,
                });
                
                if (challenge) {
                  window.location.href = `/2fa-verification?state=${encodeURIComponent(JSON.stringify({
                    factorId: verifiedFactor.id,
                    challengeId: challenge.id
                  }))}`;
                  return;
                }
              }
            }
          }

          // Check if user has completed onboarding by checking for profile and cycle baseline
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', user.id)
            .single();

          // If we get an error about user not existing, clear the session
          if (profileError && profileError.message.includes('JWT')) {
            await supabase.auth.signOut();
            return;
          }

          const { data: cycleBaseline } = await supabase
            .from('cycle_baselines')
            .select('id')
            .eq('user_id', user.id)
            .single();

          // If no profile or cycle baseline exists, redirect to onboarding
          if (!profile || !cycleBaseline) {
            window.location.href = '/onboarding';
          } else {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // Clear invalid session
          await supabase.auth.signOut();
        }
      }
    };

    checkOnboardingStatus();
  }, [user, checking2FA, toast]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      // Check if 2FA is enabled
      await check2FAStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;

    try {
      const result = await signUp(email, password, displayName);
      
      if (result.error) {
        if (result.error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: result.error.message,
            variant: "destructive",
          });
        }
      } else {
        // Check if email confirmation is required
        const emailConfirmed = result.data?.user?.email_confirmed_at;
        
        // Show confirmation dialog instead of toast
        if (!emailConfirmed) {
          setShowConfirmationDialog(true);
        }
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const check2FAStatus = async () => {
    try {
      setChecking2FA(true);
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors && factors.totp && factors.totp.length > 0) {
        const verifiedFactor = factors.totp.find(f => f.status === 'verified');
        
        if (verifiedFactor) {
          // User has 2FA enabled, create challenge and redirect
          const { data: challenge } = await supabase.auth.mfa.challenge({
            factorId: verifiedFactor.id,
          });
          
          if (challenge) {
            window.location.href = `/2fa-verification?state=${encodeURIComponent(JSON.stringify({
              factorId: verifiedFactor.id,
              challengeId: challenge.id
            }))}`;
            return;
          }
        }
      }
      
      // No 2FA enabled, let normal flow continue
      setLoading(false);
      setChecking2FA(false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      setLoading(false);
      setChecking2FA(false);
    }
  };


  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
      // 2FA check will happen in the auth state change callback
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = () => {
    setShowResetDialog(true);
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'https://app.fourmula.com/reset-password',
      });

      if (error) {
        toast({
          title: "Failed to send reset email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setShowResetDialog(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <SignInPage
        logo={<Logo size="lg" />}
        title={<span className="font-semibold text-foreground tracking-tight">Welcome to Fourmula</span>}
        description="Your cycle-syncing sports supplement companion"
        heroImageSrc={heroImage}
        testimonials={[]}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        isSignUp={isSignUp}
        onToggleMode={() => setIsSignUp(!isSignUp)}
        loading={loading}
      />

      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Check your email</DialogTitle>
            <DialogDescription className="text-center pt-4">
              We've sent you a confirmation link. Please check your email and click the link to complete your registration.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button
              onClick={() => {
                setShowConfirmationDialog(false);
                setIsSignUp(false);
              }}
              className="w-full rounded-2xl bg-gradient-primary py-4 font-medium text-primary-foreground hover:shadow-glow transition-all"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10 mt-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-foreground placeholder:text-muted-foreground"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-primary py-4 font-medium text-primary-foreground hover:shadow-glow transition-all disabled:opacity-50"
              disabled={resetLoading}
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default Auth;