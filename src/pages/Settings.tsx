import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, User, Bell, Download, Trash2, Shield, Smartphone, Save, UserCircle, Clock, Globe, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface Profile {
  user_id: string;
  display_name?: string;
  birth_year?: number;
  region?: string;
  contraception_type?: string;
  cycle_irregularity?: boolean;
  avatar_url?: string;
  country?: string;
  timezone?: string;
}

interface ReminderPlan {
  user_id: string;
  regimen?: string;
  local_time?: string;
  timezone?: string;
  quiet_hours?: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [profile, setProfile] = useState<Profile>({
    user_id: user?.id || '',
    display_name: '',
    birth_year: new Date().getFullYear() - 25,
    region: '',
    contraception_type: '',
    cycle_irregularity: false,
    avatar_url: '',
  });

  // Reminder state  
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderTimezone, setReminderTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [reminderPlan, setReminderPlan] = useState<ReminderPlan>({
    user_id: user?.id || '',
    regimen: '',
    local_time: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quiet_hours: false,
  });

  // Email notification state
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  
  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Load reminder plan
      const { data: reminderData, error: reminderError } = await supabase
        .from('reminder_plans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (reminderError && reminderError.code !== 'PGRST116') {
        console.error('Error loading reminder plan:', reminderError);
      } else if (reminderData) {
        setReminderPlan(reminderData);
        setReminderTime(reminderData.time_local || '09:00');
        setReminderTimezone(reminderData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      }

      // Check if email notifications are enabled in reminder plan
      if (reminderData) {
        setEmailNotificationsEnabled(reminderData.reminders_enabled || false);
      }
      
      // Check two-factor authentication status
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors) {
        const verifiedFactor = factors.totp.find(f => f.status === 'verified');
        setTwoFactorEnabled(!!verifiedFactor);
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    setUploading(true);
    try {
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: data.publicUrl });

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const saveReminderPlan = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminder_plans')
        .upsert({
          user_id: user.id,
          regimen: 'daily',
          time_local: reminderTime,
          timezone: reminderTimezone,
          phase_b_time: reminderTime,
          quiet_hours_on: reminderPlan.quiet_hours || false,
          reminders_enabled: true,
        });

      if (error) throw error;

      toast({
        title: "Reminder settings updated",
        description: `Daily reminder set for ${reminderTime} (${reminderTimezone})`,
      });
    } catch (error) {
      console.error('Error saving reminder plan:', error);
      toast({
        title: "Error saving reminder settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enableEmailNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminder_plans')
        .upsert({
          user_id: user.id,
          reminders_enabled: true,
          regimen: reminderPlan.regimen || 'daily',
          time_local: reminderTime,
          timezone: reminderTimezone,
          phase_b_time: reminderTime,
          quiet_hours_on: reminderPlan.quiet_hours || false,
        });

      if (error) throw error;

      setEmailNotificationsEnabled(true);
      toast({
        title: "Email notifications enabled! 📧",
        description: "You'll receive supplement reminders via email at your scheduled time.",
      });
    } catch (error) {
      console.error('Error enabling email notifications:', error);
      toast({
        title: "Error enabling notifications",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disableEmailNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminder_plans')
        .update({ reminders_enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setEmailNotificationsEnabled(false);
      toast({
        title: "Email notifications disabled",
        description: "You will no longer receive email reminders.",
      });
    } catch (error) {
      console.error('Error disabling email notifications:', error);
      toast({
        title: "Error disabling notifications",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      if (data) {
        setQrCodeUrl(data.totp.qr_code);
        setTotpSecret(data.totp.secret);
        setFactorId(data.id);
        setShowVerificationDialog(true);
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Failed to enable 2FA",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });

      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: data.id,
        code: verificationCode
      });

      if (verifyError) throw verifyError;

      setTwoFactorEnabled(true);
      setShowVerificationDialog(false);
      setVerificationCode('');
      toast({
        title: "Two-factor authentication enabled",
        description: "Your account is now more secure with 2FA.",
      });
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verification failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      setLoading(true);
      
      // Check if user needs to verify 2FA first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && (session as any).aal !== 'aal2') {
        // User needs to verify with 2FA before disabling
        toast({
          title: "Verification required",
          description: "Please verify your identity with 2FA before disabling it.",
          variant: "destructive",
        });
        
        // Create a challenge
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: factorId
        });
        
        if (challengeError) throw challengeError;
        
        // Redirect to 2FA verification page with disable intent
        window.location.href = `/2fa-verification?state=${encodeURIComponent(JSON.stringify({
          factorId: factorId,
          challengeId: challenge.id,
          action: 'disable'
        }))}`;
        return;
      }
      
      // User is at AAL2, can proceed with unenrollment
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorId
      });

      if (error) throw error;

      setTwoFactorEnabled(false);
      setFactorId('');
      toast({
        title: "Two-factor authentication disabled",
        description: "2FA has been disabled for your account.",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Failed to disable 2FA",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all user data
      const [profiles, symptom_logs, training_logs, cycle_events, phase_forecasts, adherence_goals, reminder_plans] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('symptom_logs').select('*').eq('user_id', user.id),
        supabase.from('training_logs').select('*').eq('user_id', user.id),
        supabase.from('cycle_events').select('*').eq('user_id', user.id),
        supabase.from('phase_forecasts').select('*').eq('user_id', user.id),
        supabase.from('adherence_goals').select('*').eq('user_id', user.id),
        supabase.from('reminder_plans').select('*').eq('user_id', user.id),
      ]);

      const userData = {
        user_id: user.id,
        email: user.email,
        exported_at: new Date().toISOString(),
        profiles: profiles.data || [],
        symptom_logs: symptom_logs.data || [],
        training_logs: training_logs.data || [],
        cycle_events: cycle_events.data || [],
        phase_forecasts: phase_forecasts.data || [],
        adherence_goals: adherence_goals.data || [],
        reminder_plans: reminder_plans.data || [],
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fourmula-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const tables = ['profiles', 'symptom_logs', 'training_logs', 'cycle_events', 'phase_forecasts', 'adherence_goals', 'reminder_plans'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      toast({
        title: "Data deleted",
        description: "All your data has been deleted successfully.",
      });

      // Sign out the user
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Settings">
        <div className="min-h-screen bg-gradient-soft">
          {/* Mobile Layout */}
          <div className="md:hidden px-4 py-6 space-y-6">
            {/* Floating date navigation - hidden on mobile, shown on desktop */}
            <div className="hidden md:block fixed right-6 top-1/2 transform -translate-y-1/2 z-30">
              <div className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-3 shadow-lg">
                <SettingsIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            {/* Profile Settings */}
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border/50">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-white shadow-lg">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                      disabled={uploading}
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Profile Picture</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploading ? 'Uploading...' : 'Click the camera icon to upload'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        value={profile.display_name || ''}
                        onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                        placeholder="Enter your display name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birth-year">Birth Year</Label>
                      <Input
                        id="birth-year"
                        type="number"
                        min="1920"
                        max={new Date().getFullYear()}
                        value={profile.birth_year || ''}
                        onChange={(e) => setProfile({...profile, birth_year: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select value={profile.region || ''} onValueChange={(value) => setProfile({...profile, region: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-america">North America</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="oceania">Oceania</SelectItem>
                          <SelectItem value="south-america">South America</SelectItem>
                          <SelectItem value="africa">Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country/City</Label>
                      <Input
                        id="country"
                        value={profile.country || ''}
                        onChange={(e) => setProfile({...profile, country: e.target.value})}
                        placeholder="e.g., Berlin, London, New York"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="profile-timezone" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Your Timezone
                      </Label>
                      <Select value={profile.timezone || ''} onValueChange={(value) => setProfile({...profile, timezone: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your timezone" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                          <SelectItem value="Europe/Rome">Rome (CET)</SelectItem>
                          <SelectItem value="Europe/Amsterdam">Amsterdam (CET)</SelectItem>
                          <SelectItem value="Europe/Brussels">Brussels (CET)</SelectItem>
                          <SelectItem value="Europe/Vienna">Vienna (CET)</SelectItem>
                          <SelectItem value="Europe/Athens">Athens (EET)</SelectItem>
                          <SelectItem value="Europe/Stockholm">Stockholm (CET)</SelectItem>
                          <SelectItem value="Europe/Copenhagen">Copenhagen (CET)</SelectItem>
                          <SelectItem value="Europe/Oslo">Oslo (CET)</SelectItem>
                          <SelectItem value="Europe/Helsinki">Helsinki (EET)</SelectItem>
                          <SelectItem value="Europe/Warsaw">Warsaw (CET)</SelectItem>
                          <SelectItem value="Europe/Prague">Prague (CET)</SelectItem>
                          <SelectItem value="Europe/Bucharest">Bucharest (EET)</SelectItem>
                          <SelectItem value="Europe/Budapest">Budapest (CET)</SelectItem>
                          <SelectItem value="Europe/Dublin">Dublin (GMT)</SelectItem>
                          <SelectItem value="Europe/Lisbon">Lisbon (WET)</SelectItem>
                          <SelectItem value="America/New_York">New York (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                          <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                          <SelectItem value="America/Denver">Denver (MST)</SelectItem>
                          <SelectItem value="America/Phoenix">Phoenix (MST)</SelectItem>
                          <SelectItem value="America/Toronto">Toronto (EST)</SelectItem>
                          <SelectItem value="America/Vancouver">Vancouver (PST)</SelectItem>
                          <SelectItem value="America/Mexico_City">Mexico City (CST)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                          <SelectItem value="America/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          <SelectItem value="Asia/Hong_Kong">Hong Kong (HKT)</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Bangkok (ICT)</SelectItem>
                          <SelectItem value="Asia/Mumbai">Mumbai (IST)</SelectItem>
                          <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                          <SelectItem value="Asia/Karachi">Karachi (PKT)</SelectItem>
                          <SelectItem value="Asia/Manila">Manila (PHT)</SelectItem>
                          <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                          <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                          <SelectItem value="Australia/Melbourne">Melbourne (AEDT)</SelectItem>
                          <SelectItem value="Australia/Brisbane">Brisbane (AEST)</SelectItem>
                          <SelectItem value="Australia/Perth">Perth (AWST)</SelectItem>
                          <SelectItem value="Pacific/Auckland">Auckland (NZDT)</SelectItem>
                          <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                          <SelectItem value="Africa/Johannesburg">Johannesburg (SAST)</SelectItem>
                          <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                          <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contraception">Contraception Type</Label>
                      <Select value={profile.contraception_type || ''} onValueChange={(value) => setProfile({...profile, contraception_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contraception type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="pill">Birth Control Pill</SelectItem>
                          <SelectItem value="iud">IUD</SelectItem>
                          <SelectItem value="implant">Implant</SelectItem>
                          <SelectItem value="patch">Patch</SelectItem>
                          <SelectItem value="ring">Ring</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cycle-irregularity">Irregular Cycles</Label>
                      <p className="text-sm text-muted-foreground">Do you experience irregular menstrual cycles?</p>
                    </div>
                    <Switch 
                      id="cycle-irregularity"
                      checked={profile.cycle_irregularity || false}
                      onCheckedChange={(checked) => setProfile({...profile, cycle_irregularity: checked})}
                    />
                  </div>

                <Button onClick={saveProfile} disabled={loading} className="w-full rounded-xl h-12 font-medium">
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Notification Settings</h2>
                    <p className="text-sm text-muted-foreground">Manage your reminder preferences</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive supplement reminders via email</p>
                  </div>
                  <Button 
                    variant={emailNotificationsEnabled ? "destructive" : "default"}
                    onClick={emailNotificationsEnabled ? disableEmailNotifications : enableEmailNotifications}
                    disabled={loading}
                    className="rounded-xl"
                  >
                    {emailNotificationsEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-time" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Daily Reminder Time
                      </Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Reminder Timezone
                      </Label>
                      <Select value={reminderTimezone} onValueChange={setReminderTimezone}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                          <SelectItem value="Europe/Rome">Rome (CET)</SelectItem>
                          <SelectItem value="Europe/Amsterdam">Amsterdam (CET)</SelectItem>
                          <SelectItem value="Europe/Brussels">Brussels (CET)</SelectItem>
                          <SelectItem value="Europe/Vienna">Vienna (CET)</SelectItem>
                          <SelectItem value="Europe/Athens">Athens (EET)</SelectItem>
                          <SelectItem value="Europe/Stockholm">Stockholm (CET)</SelectItem>
                          <SelectItem value="Europe/Copenhagen">Copenhagen (CET)</SelectItem>
                          <SelectItem value="Europe/Oslo">Oslo (CET)</SelectItem>
                          <SelectItem value="Europe/Helsinki">Helsinki (EET)</SelectItem>
                          <SelectItem value="Europe/Warsaw">Warsaw (CET)</SelectItem>
                          <SelectItem value="Europe/Prague">Prague (CET)</SelectItem>
                          <SelectItem value="Europe/Bucharest">Bucharest (EET)</SelectItem>
                          <SelectItem value="Europe/Budapest">Budapest (CET)</SelectItem>
                          <SelectItem value="Europe/Dublin">Dublin (GMT)</SelectItem>
                          <SelectItem value="Europe/Lisbon">Lisbon (WET)</SelectItem>
                          <SelectItem value="America/New_York">New York (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                          <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                          <SelectItem value="America/Denver">Denver (MST)</SelectItem>
                          <SelectItem value="America/Phoenix">Phoenix (MST)</SelectItem>
                          <SelectItem value="America/Toronto">Toronto (EST)</SelectItem>
                          <SelectItem value="America/Vancouver">Vancouver (PST)</SelectItem>
                          <SelectItem value="America/Mexico_City">Mexico City (CST)</SelectItem>
                          <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                          <SelectItem value="America/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                          <SelectItem value="Asia/Hong_Kong">Hong Kong (HKT)</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Bangkok (ICT)</SelectItem>
                          <SelectItem value="Asia/Mumbai">Mumbai (IST)</SelectItem>
                          <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                          <SelectItem value="Asia/Karachi">Karachi (PKT)</SelectItem>
                          <SelectItem value="Asia/Manila">Manila (PHT)</SelectItem>
                          <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                          <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                          <SelectItem value="Australia/Melbourne">Melbourne (AEDT)</SelectItem>
                          <SelectItem value="Australia/Brisbane">Brisbane (AEST)</SelectItem>
                          <SelectItem value="Australia/Perth">Perth (AWST)</SelectItem>
                          <SelectItem value="Pacific/Auckland">Auckland (NZDT)</SelectItem>
                          <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                          <SelectItem value="Africa/Johannesburg">Johannesburg (SAST)</SelectItem>
                          <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                          <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="quiet-hours">Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">Disable notifications during sleep hours (10 PM - 7 AM)</p>
                    </div>
                    <Switch 
                      id="quiet-hours"
                      checked={Boolean((reminderPlan as any).quiet_hours_on) || false}
                      onCheckedChange={(checked) => setReminderPlan({ ...(reminderPlan as any), quiet_hours_on: checked } as any)}
                    />
                  </div>

                <Button onClick={saveReminderPlan} disabled={loading} className="w-full rounded-xl h-12 font-medium">
                  {loading ? 'Saving...' : 'Save Reminder Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground">Manage your account security settings</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Two-Factor Authentication</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  {twoFactorEnabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableTwoFactor}
                      disabled={loading}
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={enableTwoFactor}
                      disabled={loading}
                    >
                      Enable
                    </Button>
                  )}
                </div>

                {twoFactorEnabled && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      2FA is active and protecting your account
                    </p>
                  </div>
                )}

                {showQRCode && (
                  <div className="p-4 bg-accent/10 rounded-xl border border-primary/20">
                    <h3 className="font-medium mb-3 text-foreground">Setup Two-Factor Authentication</h3>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        1. Download an authenticator app like Google Authenticator or Authy
                      </p>
                      <div className="flex justify-center p-4 bg-background rounded-xl">
                        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground text-center">QR Code<br />Placeholder</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2. Scan this QR code with your authenticator app
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="2fa-code">Enter the 6-digit code from your app:</Label>
                        <Input
                          id="2fa-code"
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>
                      <Button className="w-full rounded-xl">
                        Verify and Enable 2FA
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Privacy & Data</h2>
                    <p className="text-sm text-muted-foreground">Manage your data and privacy settings</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <Button
                    onClick={exportData}
                    disabled={loading}
                    variant="outline"
                    className="w-full flex items-center space-x-2 rounded-xl h-12 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>{loading ? 'Exporting...' : 'Export My Data'}</span>
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                      <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" disabled={loading} className="w-full rounded-xl h-12 font-medium">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All Data
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-bold text-destructive">
                              ⚠️ Delete Account & All Data
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4 text-base">
                              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                <p className="font-semibold text-foreground mb-2">This action is PERMANENT and IRREVERSIBLE!</p>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    <span>Your account will be completely deleted</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    <span>You will NOT be able to log in anymore</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    <span>All your data will be permanently deleted from our servers (cycle tracking, symptoms, training logs, chat history, etc.)</span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-destructive mt-0.5">•</span>
                                    <span>This data CANNOT be recovered</span>
                                  </li>
                                </ul>
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                Are you absolutely sure you want to proceed?
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={deleteAllData}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                            >
                              Yes, permanently delete everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Layout */} 
          <div className="hidden md:block">
            <div className="min-h-screen bg-gray-50">
              <div className="p-8">
                <div className="max-w-6xl mx-auto">
                  {/* Professional Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                          <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                          <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabbed Interface */}
                  <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-2xl shadow-sm">
                      <TabsTrigger value="profile" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">
                        <UserCircle className="w-4 h-4" />
                        <span>Profile</span>
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">
                        <Bell className="w-4 h-4" />
                        <span>Notifications</span>
                      </TabsTrigger>
                      <TabsTrigger value="security" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">
                        <Shield className="w-4 h-4" />
                        <span>Security</span>
                      </TabsTrigger>
                      <TabsTrigger value="data" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl">
                        <Download className="w-4 h-4" />
                        <span>Data & Privacy</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                      <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8">
                          <Card className="bg-white border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-xl text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2 text-primary" />
                                Personal Information
                              </CardTitle>
                              <CardDescription>
                                Update your personal details and preferences
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                              {/* Profile Picture Upload */}
                              <div className="flex justify-center mb-8 pb-8 border-b border-gray-100">
                                <div className="flex flex-col items-center space-y-4">
                                  <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-4 border-white shadow-xl">
                                      {profile.avatar_url ? (
                                        <img 
                                          src={profile.avatar_url} 
                                          alt="Profile" 
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <User className="w-16 h-16 text-muted-foreground" />
                                      )}
                                    </div>
                                    <button
                                      onClick={() => fileInputRef.current?.click()}
                                      className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                                      disabled={uploading}
                                    >
                                      <Camera className="w-5 h-5 text-white" />
                                    </button>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={uploadAvatar}
                                      className="hidden"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-base font-semibold text-foreground">Profile Picture</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {uploading ? 'Uploading...' : 'Click the camera icon to change'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                  <div className="space-y-3">
                                    <Label htmlFor="display-name" className="text-base font-semibold text-gray-900">
                                      Display Name
                                    </Label>
                                    <Input
                                      id="display-name"
                                      value={profile.display_name || ''}
                                      onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                                      placeholder="Enter your display name"
                                      className="h-12 rounded-xl border-gray-200 focus:border-primary"
                                    />
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <Label htmlFor="birth-year" className="text-base font-semibold text-gray-900">
                                      Birth Year
                                    </Label>
                                    <Input
                                      id="birth-year"
                                      type="number"
                                      min="1920"
                                      max={new Date().getFullYear()}
                                      value={profile.birth_year || ''}
                                      onChange={(e) => setProfile({...profile, birth_year: parseInt(e.target.value)})}
                                      className="h-12 rounded-xl border-gray-200 focus:border-primary"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <div className="space-y-3">
                                    <Label htmlFor="region" className="text-base font-semibold text-gray-900">
                                      Region
                                    </Label>
                                    <Select value={profile.region || ''} onValueChange={(value) => setProfile({...profile, region: value})}>
                                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-primary">
                                        <SelectValue placeholder="Select your region" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="north-america">North America</SelectItem>
                                        <SelectItem value="europe">Europe</SelectItem>
                                        <SelectItem value="asia">Asia</SelectItem>
                                        <SelectItem value="oceania">Oceania</SelectItem>
                                        <SelectItem value="south-america">South America</SelectItem>
                                        <SelectItem value="africa">Africa</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-3">
                                    <Label htmlFor="contraception" className="text-base font-semibold text-gray-900">
                                      Contraception Type
                                    </Label>
                                    <Select value={profile.contraception_type || ''} onValueChange={(value) => setProfile({...profile, contraception_type: value})}>
                                      <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-primary">
                                        <SelectValue placeholder="Select contraception type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="pill">Birth Control Pill</SelectItem>
                                        <SelectItem value="iud">IUD</SelectItem>
                                        <SelectItem value="implant">Implant</SelectItem>
                                        <SelectItem value="patch">Patch</SelectItem>
                                        <SelectItem value="ring">Ring</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8 mt-8">
                                <div className="space-y-3">
                                  <Label htmlFor="country-desktop" className="text-base font-semibold text-gray-900">
                                    Country/City
                                  </Label>
                                  <Input
                                    id="country-desktop"
                                    value={profile.country || ''}
                                    onChange={(e) => setProfile({...profile, country: e.target.value})}
                                    placeholder="e.g., Berlin, London, New York"
                                    className="h-12 rounded-xl border-gray-200 focus:border-primary"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <Label htmlFor="profile-timezone-desktop" className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Your Timezone
                                  </Label>
                                  <Select value={profile.timezone || ''} onValueChange={(value) => setProfile({...profile, timezone: value})}>
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-primary">
                                      <SelectValue placeholder="Select your timezone" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                                      <SelectItem value="Europe/Berlin">Berlin (CET)</SelectItem>
                                      <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                                      <SelectItem value="Europe/Rome">Rome (CET)</SelectItem>
                                      <SelectItem value="Europe/Amsterdam">Amsterdam (CET)</SelectItem>
                                      <SelectItem value="Europe/Brussels">Brussels (CET)</SelectItem>
                                      <SelectItem value="Europe/Vienna">Vienna (CET)</SelectItem>
                                      <SelectItem value="Europe/Athens">Athens (EET)</SelectItem>
                                      <SelectItem value="Europe/Stockholm">Stockholm (CET)</SelectItem>
                                      <SelectItem value="Europe/Copenhagen">Copenhagen (CET)</SelectItem>
                                      <SelectItem value="Europe/Oslo">Oslo (CET)</SelectItem>
                                      <SelectItem value="Europe/Helsinki">Helsinki (EET)</SelectItem>
                                      <SelectItem value="Europe/Warsaw">Warsaw (CET)</SelectItem>
                                      <SelectItem value="Europe/Prague">Prague (CET)</SelectItem>
                                      <SelectItem value="Europe/Bucharest">Bucharest (EET)</SelectItem>
                                      <SelectItem value="Europe/Budapest">Budapest (CET)</SelectItem>
                                      <SelectItem value="Europe/Dublin">Dublin (GMT)</SelectItem>
                                      <SelectItem value="Europe/Lisbon">Lisbon (WET)</SelectItem>
                                      <SelectItem value="America/New_York">New York (EST)</SelectItem>
                                      <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                                      <SelectItem value="America/Chicago">Chicago (CST)</SelectItem>
                                      <SelectItem value="America/Denver">Denver (MST)</SelectItem>
                                      <SelectItem value="America/Phoenix">Phoenix (MST)</SelectItem>
                                      <SelectItem value="America/Toronto">Toronto (EST)</SelectItem>
                                      <SelectItem value="America/Vancouver">Vancouver (PST)</SelectItem>
                                      <SelectItem value="America/Mexico_City">Mexico City (CST)</SelectItem>
                                      <SelectItem value="America/Sao_Paulo">São Paulo (BRT)</SelectItem>
                                      <SelectItem value="America/Buenos_Aires">Buenos Aires (ART)</SelectItem>
                                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                                      <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
                                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                                      <SelectItem value="Asia/Hong_Kong">Hong Kong (HKT)</SelectItem>
                                      <SelectItem value="Asia/Singapore">Singapore (SGT)</SelectItem>
                                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                                      <SelectItem value="Asia/Bangkok">Bangkok (ICT)</SelectItem>
                                      <SelectItem value="Asia/Mumbai">Mumbai (IST)</SelectItem>
                                      <SelectItem value="Asia/Kolkata">Kolkata (IST)</SelectItem>
                                      <SelectItem value="Asia/Karachi">Karachi (PKT)</SelectItem>
                                      <SelectItem value="Asia/Manila">Manila (PHT)</SelectItem>
                                      <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                                      <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                                      <SelectItem value="Australia/Melbourne">Melbourne (AEDT)</SelectItem>
                                      <SelectItem value="Australia/Brisbane">Brisbane (AEST)</SelectItem>
                                      <SelectItem value="Australia/Perth">Perth (AWST)</SelectItem>
                                      <SelectItem value="Pacific/Auckland">Auckland (NZDT)</SelectItem>
                                      <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                                      <SelectItem value="Africa/Johannesburg">Johannesburg (SAST)</SelectItem>
                                      <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                                      <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label htmlFor="cycle-irregularity" className="text-base font-semibold text-gray-900">
                                      Irregular Cycles
                                    </Label>
                                    <p className="text-sm text-gray-600">Do you experience irregular menstrual cycles?</p>
                                  </div>
                                  <Switch 
                                    id="cycle-irregularity"
                                    checked={profile.cycle_irregularity || false}
                                    onCheckedChange={(checked) => setProfile({...profile, cycle_irregularity: checked})}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="col-span-4">
                          <div className="sticky top-8 space-y-6">
                            <Card className="bg-white border border-gray-200 shadow-sm">
                              <CardContent className="p-6">
                                <Button 
                                  onClick={saveProfile} 
                                  disabled={loading} 
                                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {loading ? 'Saving Profile...' : 'Save Profile'}
                                </Button>
                              </CardContent>
                            </Card>

                            <Card className="bg-blue-50 border border-blue-200">
                              <CardContent className="p-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserCircle className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Profile Tips</h3>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p>• Complete your profile for personalized insights</p>
                                    <p>• Birth year helps with age-related recommendations</p>
                                    <p>• Region affects vitamin D recommendations</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                      <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8">
                          <Card className="bg-white border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-xl text-gray-900 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-primary" />
                                Notification Preferences
                              </CardTitle>
                              <CardDescription>
                                Configure your reminder and notification settings
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label className="text-base font-semibold text-gray-900">Email Notifications</Label>
                                    <p className="text-sm text-gray-600">Receive supplement reminders via email</p>
                                  </div>
                                  <Button 
                                    variant={emailNotificationsEnabled ? "destructive" : "default"}
                                    onClick={emailNotificationsEnabled ? disableEmailNotifications : enableEmailNotifications}
                                    disabled={loading}
                                    className="rounded-xl"
                                  >
                                    {emailNotificationsEnabled ? 'Disable' : 'Enable'}
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <Label htmlFor="reminder-time" className="text-base font-semibold text-gray-900">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Daily Reminder Time
                                  </Label>
                                  <Input
                                    id="reminder-time"
                                    type="time"
                                    value={reminderPlan.local_time || '09:00'}
                                    onChange={(e) => setReminderPlan({...reminderPlan, local_time: e.target.value})}
                                    className="h-12 rounded-xl border-gray-200 focus:border-primary"
                                  />
                                </div>

                                <div className="space-y-3">
                                  <Label htmlFor="regimen" className="text-base font-semibold text-gray-900">
                                    <Globe className="w-4 h-4 inline mr-2" />
                                    Supplement Regimen
                                  </Label>
                                  <Select value={reminderPlan.regimen || ''} onValueChange={(value) => setReminderPlan({...reminderPlan, regimen: value})}>
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-primary">
                                      <SelectValue placeholder="Select regimen" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="daily">Daily</SelectItem>
                                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="as-needed">As Needed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label htmlFor="quiet-hours" className="text-base font-semibold text-gray-900">Quiet Hours</Label>
                                    <p className="text-sm text-gray-600">Disable notifications during sleep hours (10 PM - 7 AM)</p>
                                  </div>
                                  <Switch 
                                    id="quiet-hours"
                                    checked={reminderPlan.quiet_hours || false}
                                    onCheckedChange={(checked) => setReminderPlan({...reminderPlan, quiet_hours: checked})}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="col-span-4">
                          <div className="sticky top-8 space-y-6">
                            <Card className="bg-white border border-gray-200 shadow-sm">
                              <CardContent className="p-6">
                                <Button 
                                  onClick={saveReminderPlan} 
                                  disabled={loading} 
                                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {loading ? 'Saving...' : 'Save Notification Settings'}
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                      <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8">
                          <Card className="bg-white border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-xl text-gray-900 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-primary" />
                                Security Settings
                              </CardTitle>
                              <CardDescription>
                                Manage your account security and authentication
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                                      <Smartphone className="w-4 h-4" />
                                      <span>Two-Factor Authentication</span>
                                    </Label>
                                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                  </div>
                                  {twoFactorEnabled ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={disableTwoFactor}
                                      disabled={loading}
                                    >
                                      Disable
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={enableTwoFactor}
                                      disabled={loading}
                                    >
                                      Enable
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {twoFactorEnabled && (
                                <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                                  <p className="text-sm text-green-800 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    2FA is active and protecting your account
                                  </p>
                                </div>
                              )}

                              {showQRCode && (
                                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                                  <h3 className="font-semibold text-gray-900 mb-4">Setup Two-Factor Authentication</h3>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      1. Download an authenticator app like Google Authenticator or Authy
                                    </p>
                                    <div className="flex justify-center p-6 bg-white rounded-xl">
                                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-gray-500 text-center">QR Code<br />Placeholder</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      2. Scan this QR code with your authenticator app
                                    </p>
                                    <div className="space-y-3">
                                      <Label htmlFor="2fa-code" className="text-base font-semibold text-gray-900">
                                        Enter the 6-digit code from your app:
                                      </Label>
                                      <Input
                                        id="2fa-code"
                                        placeholder="000000"
                                        maxLength={6}
                                        className="text-center text-lg tracking-widest h-12 rounded-xl border-gray-200 focus:border-primary"
                                      />
                                    </div>
                                    <Button className="w-full h-12 rounded-xl">
                                      Verify and Enable 2FA
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div className="col-span-4">
                          <div className="sticky top-8">
                            <Card className="bg-green-50 border border-green-200">
                              <CardContent className="p-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-green-600" />
                                  </div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Security Tips</h3>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p>• Use a strong, unique password</p>
                                    <p>• Enable 2FA for extra security</p>
                                    <p>• Keep your app updated</p>
                                    <p>• Don't share login credentials</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Data & Privacy Tab */}
                    <TabsContent value="data" className="space-y-6">
                      <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-8">
                          <Card className="bg-white border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-xl text-gray-900 flex items-center">
                                <Download className="w-5 h-5 mr-2 text-primary" />
                                Data & Privacy Management
                              </CardTitle>
                              <CardDescription>
                                Control your data and privacy settings
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                              <div className="space-y-6">
                                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                                  <h3 className="font-semibold text-gray-900 mb-2">Export Your Data</h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Download all your personal data including cycle tracking, symptoms, training logs, and preferences in JSON format.
                                  </p>
                                  <Button
                                    onClick={exportData}
                                    disabled={loading}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-blue-300 hover:bg-blue-100"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    {loading ? 'Exporting...' : 'Export My Data'}
                                  </Button>
                                </div>

                                <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                                  <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                                  <p className="text-sm text-red-700 mb-4">
                                    This action cannot be undone. This will permanently delete your account and all associated data including cycle tracking, symptoms, training logs, and preferences.
                                  </p>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" disabled={loading} className="w-full h-12 rounded-xl">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete All Data
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-2xl max-w-md">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-2xl font-bold text-destructive">
                                          ⚠️ Delete Account & All Data
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-4 text-base">
                                          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                            <p className="font-semibold text-foreground mb-2">This action is PERMANENT and IRREVERSIBLE!</p>
                                            <ul className="space-y-2 text-sm">
                                              <li className="flex items-start gap-2">
                                                <span className="text-destructive mt-0.5">•</span>
                                                <span>Your account will be completely deleted</span>
                                              </li>
                                              <li className="flex items-start gap-2">
                                                <span className="text-destructive mt-0.5">•</span>
                                                <span>You will NOT be able to log in anymore</span>
                                              </li>
                                              <li className="flex items-start gap-2">
                                                <span className="text-destructive mt-0.5">•</span>
                                                <span>All your data will be permanently deleted from our servers (cycle tracking, symptoms, training logs, chat history, etc.)</span>
                                              </li>
                                              <li className="flex items-start gap-2">
                                                <span className="text-destructive mt-0.5">•</span>
                                                <span>This data CANNOT be recovered</span>
                                              </li>
                                            </ul>
                                          </div>
                                          <p className="text-sm font-medium text-foreground">
                                            Are you absolutely sure you want to proceed?
                                          </p>
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={deleteAllData}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                        >
                                          Yes, permanently delete everything
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="col-span-4">
                          <div className="sticky top-8">
                            <Card className="bg-yellow-50 border border-yellow-200">
                              <CardContent className="p-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Download className="w-6 h-6 text-yellow-600" />
                                  </div>
                                  <h3 className="font-semibold text-gray-900 mb-2">Your Data Rights</h3>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <p>• Right to access your data</p>
                                    <p>• Right to export your data</p>
                                    <p>• Right to delete your data</p>
                                    <p>• Data is encrypted and secure</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Verification Dialog */}
        <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Set up Two-Factor Authentication</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <div className="text-sm">
                  <p className="mb-3">Scan this QR code with your authenticator app (like Google Authenticator, Authy, or 1Password):</p>
                  {qrCodeUrl && (
                    <div className="flex justify-center my-4">
                      <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
                    </div>
                  )}
                  <div className="bg-muted p-3 rounded-lg my-3">
                    <p className="text-xs text-muted-foreground mb-1">Or enter this code manually:</p>
                    <code className="text-xs font-mono break-all">{totpSecret}</code>
                  </div>
                  <p className="mb-3">Then enter the 6-digit code from your app:</p>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowVerificationDialog(false);
                setVerificationCode('');
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={verifyAndEnable2FA}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Settings;