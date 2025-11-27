import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Logo from "@/components/Logo";

const TRAINING_STYLES = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "mixed", label: "Mixed" },
  { value: "yoga_pilates", label: "Yoga/Pilates" },
  { value: "team_sport", label: "Team Sport" },
  { value: "other", label: "Other" },
];

const FITNESS_GOALS = [
  { value: "build_muscle", label: "Build muscle / strength" },
  { value: "lose_weight", label: "Lose weight / tone up" },
  { value: "improve_performance", label: "Improve performance / endurance" },
  { value: "build_routine", label: "Build a consistent routine" },
  { value: "recover_injury", label: "Recover from injury / prevent injury" },
  { value: "feel_healthier", label: "Feel healthier & balanced" },
];

const PMS_SYMPTOMS = [
  { value: "cramps", label: "Cramps" },
  { value: "bloating", label: "Bloating" },
  { value: "headaches", label: "Headaches" },
  { value: "breast_tenderness", label: "Breast tenderness" },
  { value: "mood_swings", label: "Mood swings" },
  { value: "low_energy", label: "Low energy" },
  { value: "digestive_changes", label: "Digestive changes" },
];

const KNOWN_CONDITIONS = [
  { value: "endometriosis", label: "Endometriosis" },
  { value: "pcos", label: "PCOS" },
  { value: "amenorrhea", label: "Irregular/absent cycles" },
  { value: "heavy_bleeding", label: "Heavy menstrual bleeding" },
  { value: "thyroid", label: "Thyroid conditions" },
  { value: "pmdd", label: "PMDD" },
  { value: "early_menopause", label: "Early menopause/perimenopause" },
  { value: "anemia", label: "Anemia" },
  { value: "diabetes", label: "Diabetes" },
  { value: "autoimmune", label: "Autoimmune" },
  { value: "migraines", label: "Migraines" },
  { value: "asthma", label: "Asthma" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basics
    displayName: "",
    birthYear: new Date().getFullYear() - 25,
    country: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
    heightCm: 165,
    heightUnit: "cm" as "cm" | "ft",
    weightKg: 65,
    weightUnit: "kg" as "kg" | "lbs" | "stone",
    
    // Step 2: Cycle Anchor
    lastPeriodStart: "",
    avgCycleLength: 28,
    cycleRegularity: "regular" as "regular" | "irregular" | "not_sure",
    lutealLength: 14,
    
    // Step 3: Health Context
    contraceptionType: "",
    tryingToConceive: false,
    pregnancyStatus: "no" as "no" | "pregnant" | "postpartum",
    
    // Step 4: Training Profile
    trainingStyles: [] as string[],
    weeklyTrainingGoal: 3,
    sessionLength: "40-60m",
    fitnessGoals: [] as string[],
    
    // Step 5: Health & Lifestyle
    sleepQuality: "ok" as "poor" | "ok" | "good",
    stressLevel: "medium" as "low" | "medium" | "high",
    commonPmsSymptoms: [] as string[],
    knownConditions: [] as string[],
    
    // Step 6: Notifications
    remindersEnabled: true,
    supplementRegimen: "phase_b" as "daily" | "phase_a" | "phase_b" | "both",
    phaseATime: "08:00",
    phaseBTime: "21:00",
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: formData.displayName,
          birth_year: formData.birthYear,
          country: formData.country,
          timezone: formData.timezone,
          height_cm: formData.heightCm,
          weight_kg: formData.weightKg,
          cycle_regularity: formData.cycleRegularity,
          trying_to_conceive: formData.tryingToConceive,
          pregnancy_status: formData.pregnancyStatus,
          contraception_type: formData.contraceptionType || null,
          training_styles: formData.trainingStyles,
          weekly_training_goal: formData.weeklyTrainingGoal,
          session_length: formData.sessionLength,
          fitness_goals: formData.fitnessGoals,
          sleep_quality: formData.sleepQuality,
          stress_level: formData.stressLevel,
          common_pms_symptoms: formData.commonPmsSymptoms,
          known_conditions: formData.knownConditions,
        });

      if (profileError) throw profileError;

      // Save cycle baseline
      const { error: baselineError } = await supabase
        .from("cycle_baselines")
        .upsert({
          user_id: user.id,
          last_period_start: formData.lastPeriodStart,
          avg_cycle_len: formData.avgCycleLength,
          luteal_len: formData.lutealLength,
        });

      if (baselineError) throw baselineError;

      // Save reminder plan if enabled
      if (formData.remindersEnabled) {
        const reminderData: any = {
          user_id: user.id,
          regimen: formData.supplementRegimen,
          timezone: formData.timezone,
          reminders_enabled: true,
          phase_a_training_days_only: true,
        };

        // Set appropriate time fields based on regimen
        if (formData.supplementRegimen === "phase_a" || formData.supplementRegimen === "both") {
          reminderData.phase_a_time = formData.phaseATime;
        }
        if (formData.supplementRegimen === "phase_b" || formData.supplementRegimen === "both" || formData.supplementRegimen === "daily") {
          reminderData.phase_b_time = formData.phaseBTime;
        }
        // For backwards compatibility with old time_local field
        reminderData.time_local = formData.phaseBTime;

        const { error: reminderError } = await supabase
          .from("reminder_plans")
          .upsert(reminderData);

        if (reminderError) throw reminderError;
      }

      // Build cycle forecast - wait for completion
      toast.loading("Building your cycle forecast...", { id: "forecast" });
      
      const { data: forecastData, error: forecastError } = await supabase.functions.invoke("rebuild-forecast", {
        body: { user_id: user.id },
      });

      if (forecastError) {
        console.error("Forecast error:", forecastError);
        toast.error("Forecast build failed, but your profile was saved", { id: "forecast" });
      } else {
        toast.success("Profile setup complete!", { id: "forecast" });
      }

      // Small delay to ensure database is consistent
      await new Promise(resolve => setTimeout(resolve, 500));

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.displayName.trim() !== "";
      case 2:
        return formData.lastPeriodStart !== "";
      case 3:
      case 4:
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome to Fourmula</CardTitle>
              <CardDescription>
                Let's personalize your experience (Step {step} of 6)
              </CardDescription>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    We ask these questions so your personal AI coach can tailor your cycle tracking, training, and health insights just for you. All of your personal information is completely private, securely stored, and never shared.
                  </p>
                </div>

                <div>
                  <Label htmlFor="displayName">What should I call you?</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={formData.displayName}
                    onChange={(e) => updateFormData({ displayName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="birthYear">Year of Birth</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    min={1940}
                    max={new Date().getFullYear()}
                    value={formData.birthYear}
                    onChange={(e) =>
                      updateFormData({ birthYear: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United Kingdom"
                    value={formData.country}
                    onChange={(e) => updateFormData({ country: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => updateFormData({ timezone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Height</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) =>
                          updateFormData({ heightCm: parseFloat(e.target.value) })
                        }
                      />
                      <Select
                        value={formData.heightUnit}
                        onValueChange={(value: "cm" | "ft") =>
                          updateFormData({ heightUnit: value })
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="ft">ft/in</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Weight</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) =>
                          updateFormData({ weightKg: parseFloat(e.target.value) })
                        }
                      />
                      <Select
                        value={formData.weightUnit}
                        onValueChange={(value: "kg" | "lbs" | "stone") =>
                          updateFormData({ weightUnit: value })
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                          <SelectItem value="stone">stone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Cycle Anchor */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lastPeriodStart">Last Period Start Date</Label>
                  <Input
                    id="lastPeriodStart"
                    type="date"
                    value={formData.lastPeriodStart}
                    onChange={(e) =>
                      updateFormData({ lastPeriodStart: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="avgCycleLength">
                    Average Cycle Length (days)
                  </Label>
                  <Select
                    value={formData.avgCycleLength.toString()}
                    onValueChange={(value) =>
                      updateFormData({ avgCycleLength: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => i + 21).map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cycle Regularity</Label>
                  <RadioGroup
                    value={formData.cycleRegularity}
                    onValueChange={(value: "regular" | "irregular" | "not_sure") =>
                      updateFormData({ cycleRegularity: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">Regular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="irregular" id="irregular" />
                      <Label htmlFor="irregular">Irregular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_sure" id="not_sure" />
                      <Label htmlFor="not_sure">Not sure</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="lutealLength">Luteal Phase Length (days)</Label>
                  <Input
                    id="lutealLength"
                    type="number"
                    min={11}
                    max={17}
                    value={formData.lutealLength}
                    onChange={(e) =>
                      updateFormData({ lutealLength: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Most luteal phases last 11–17 days. We've set 14 as the default. If you're not sure, just leave it at 14.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Health Context */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contraceptionType">Current Contraception</Label>
                  <Select
                    value={formData.contraceptionType}
                    onValueChange={(value) =>
                      updateFormData({ contraceptionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contraception" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="hormonal_iud">Hormonal IUD</SelectItem>
                      <SelectItem value="copper_iud">Copper IUD</SelectItem>
                      <SelectItem value="implant">Implant</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                      <SelectItem value="ring">Ring</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tryingToConceive"
                    checked={formData.tryingToConceive}
                    onCheckedChange={(checked) =>
                      updateFormData({ tryingToConceive: checked === true })
                    }
                  />
                  <Label htmlFor="tryingToConceive">Trying to conceive</Label>
                </div>

                <div>
                  <Label>Pregnancy Status</Label>
                  <RadioGroup
                    value={formData.pregnancyStatus}
                    onValueChange={(value: "no" | "pregnant" | "postpartum") =>
                      updateFormData({ pregnancyStatus: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="not_pregnant" />
                      <Label htmlFor="not_pregnant">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pregnant" id="pregnant" />
                      <Label htmlFor="pregnant">Pregnant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="postpartum" id="postpartum" />
                      <Label htmlFor="postpartum">Postpartum (&lt;12 months)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Training Profile */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Optional but helps us personalize your training recommendations
                </p>

                <div>
                  <Label>Primary Training Styles</Label>
                  <MultiSelectChips
                    options={TRAINING_STYLES}
                    selected={formData.trainingStyles}
                    onChange={(selected) =>
                      updateFormData({ trainingStyles: selected })
                    }
                  />
                </div>

                <div>
                  <Label>
                    Weekly Training Goal: {formData.weeklyTrainingGoal} days
                  </Label>
                  <Slider
                    min={0}
                    max={7}
                    step={1}
                    value={[formData.weeklyTrainingGoal]}
                    onValueChange={([value]) =>
                      updateFormData({ weeklyTrainingGoal: value })
                    }
                  />
                </div>

                <div>
                  <Label>Typical Session Length</Label>
                  <RadioGroup
                    value={formData.sessionLength}
                    onValueChange={(value) =>
                      updateFormData({ sessionLength: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="20-40m" id="short" />
                      <Label htmlFor="short">20–40 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="40-60m" id="medium" />
                      <Label htmlFor="medium">40–60 minutes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="60m+" id="long" />
                      <Label htmlFor="long">60+ minutes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Top Fitness Goals</Label>
                  <MultiSelectChips
                    options={FITNESS_GOALS}
                    selected={formData.fitnessGoals}
                    onChange={(selected) =>
                      updateFormData({ fitnessGoals: selected })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 5: Health & Lifestyle */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Optional but helps us provide better health insights
                </p>

                <div>
                  <Label>Sleep Quality (on average)</Label>
                  <RadioGroup
                    value={formData.sleepQuality}
                    onValueChange={(value: "poor" | "ok" | "good") =>
                      updateFormData({ sleepQuality: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poor" id="sleep_poor" />
                      <Label htmlFor="sleep_poor">Poor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ok" id="sleep_ok" />
                      <Label htmlFor="sleep_ok">OK</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="sleep_good" />
                      <Label htmlFor="sleep_good">Good</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Stress Level (on average)</Label>
                  <RadioGroup
                    value={formData.stressLevel}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      updateFormData({ stressLevel: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="stress_low" />
                      <Label htmlFor="stress_low">Low</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="stress_medium" />
                      <Label htmlFor="stress_medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="stress_high" />
                      <Label htmlFor="stress_high">High</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Common PMS Symptoms</Label>
                  <MultiSelectChips
                    options={PMS_SYMPTOMS}
                    selected={formData.commonPmsSymptoms}
                    onChange={(selected) =>
                      updateFormData({ commonPmsSymptoms: selected })
                    }
                  />
                </div>

                <div>
                  <Label>Known Conditions (optional)</Label>
                  <MultiSelectChips
                    options={KNOWN_CONDITIONS}
                    selected={formData.knownConditions}
                    onChange={(selected) =>
                      updateFormData({ knownConditions: selected })
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 6: Notifications */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remindersEnabled"
                    checked={formData.remindersEnabled}
                    onCheckedChange={(checked) =>
                      updateFormData({ remindersEnabled: checked === true })
                    }
                  />
                  <Label htmlFor="remindersEnabled">
                    Enable supplement reminders
                  </Label>
                </div>

                {formData.remindersEnabled && (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        Reminders appear in the app when you're active. You can update these anytime in Settings → Notifications.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="supplementRegimen">Supplement Regimen</Label>
                      <Select
                        value={formData.supplementRegimen}
                        onValueChange={(value: "daily" | "phase_a" | "phase_b" | "both") =>
                          updateFormData({ supplementRegimen: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="phase_b">
                            Phase B Only (Luteal + Menstrual)
                          </SelectItem>
                          <SelectItem value="phase_a">
                            Phase A Only (Follicular + Ovulatory)
                          </SelectItem>
                          <SelectItem value="both">Both Phases</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.supplementRegimen === "phase_a" ||
                      formData.supplementRegimen === "both") && (
                      <div>
                        <Label htmlFor="phaseATime">
                          Phase A Reminder Time (morning - on training days)
                        </Label>
                        <Input
                          id="phaseATime"
                          type="time"
                          value={formData.phaseATime}
                          onChange={(e) =>
                            updateFormData({ phaseATime: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {(formData.supplementRegimen === "phase_b" ||
                      formData.supplementRegimen === "both" ||
                      formData.supplementRegimen === "daily") && (
                      <div>
                        <Label htmlFor="phaseBTime">
                          Phase B Reminder Time (evening - before bed)
                        </Label>
                        <Input
                          id="phaseBTime"
                          type="time"
                          value={formData.phaseBTime}
                          onChange={(e) =>
                            updateFormData({ phaseBTime: e.target.value })
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
              >
                Back
              </Button>
              {step < 6 ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || !isStepValid()}>
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
