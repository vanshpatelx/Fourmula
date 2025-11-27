import React, { useState } from "react";
import { Calendar, Heart, Droplets, Smile, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CycleData {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  nextPeriod: number;
}

const CycleTracker = () => {
  const [cycleData] = useState<CycleData>({
    currentDay: 18,
    cycleLength: 28,
    periodLength: 5,
    nextPeriod: 10,
  });

  const [selectedFlow, setSelectedFlow] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");

  const flowOptions = [
    { value: "light", label: "Light", color: "bg-pink-200" },
    { value: "medium", label: "Medium", color: "bg-pink-400" },
    { value: "heavy", label: "Heavy", color: "bg-pink-600" },
  ];

  const moodOptions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "sad", label: "Sad", emoji: "😢" },
    { value: "anxious", label: "Anxious", emoji: "😰" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Cycle Overview */}
      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Cycle Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              Day {cycleData.currentDay}
            </div>
            <p className="text-sm text-muted-foreground">of your cycle</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Next period in</span>
              <Badge variant="secondary">{cycleData.nextPeriod} days</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cycle length</span>
              <span className="text-sm font-medium">{cycleData.cycleLength} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Tracking */}
      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Droplets className="w-5 h-5 text-primary" />
            Track Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {flowOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedFlow === option.value ? "default" : "outline"}
                onClick={() => setSelectedFlow(option.value)}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <div className={`w-4 h-4 rounded-full ${option.color}`} />
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Select today's flow intensity
          </p>
        </CardContent>
      </Card>

      {/* Mood Tracking */}
      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smile className="w-5 h-5 text-primary" />
            Track Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedMood === option.value ? "default" : "outline"}
                onClick={() => setSelectedMood(option.value)}
                className="h-auto py-3 flex flex-col gap-1"
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            How are you feeling today?
          </p>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-card shadow-soft border-0 md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Cycle Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-primary-soft/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">85%</div>
              <p className="text-sm text-muted-foreground">Prediction accuracy</p>
            </div>
            <div className="text-center p-4 bg-primary-soft/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">{cycleData.periodLength}</div>
              <p className="text-sm text-muted-foreground">Average period length</p>
            </div>
            <div className="text-center p-4 bg-primary-soft/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">3</div>
              <p className="text-sm text-muted-foreground">Months tracked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CycleTracker;