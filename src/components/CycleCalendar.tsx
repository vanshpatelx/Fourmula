import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: number;
  isPeriod: boolean;
  isFertile: boolean;
  isToday: boolean;
  isPredicted: boolean;
}

const CycleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'twoWeek'>('month');

  // Generate month view
  const generateMonthDays = (): CalendarDay[] => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const today = new Date();
    
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      isPeriod: [3, 4, 5, 6, 7].includes(i + 1) || [24, 25, 26, 27, 28].includes(i + 1),
      isFertile: [12, 13, 14, 15, 16, 17, 18].includes(i + 1),
      isToday: today.getDate() === i + 1 && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear(),
      isPredicted: [24, 25, 26, 27, 28].includes(i + 1),
    }));
  };

  // Generate 2-week view starting from the current week
  const generateTwoWeekDays = (): CalendarDay[] => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Go to Sunday of current week
    
    const today = new Date();
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      days.push({
        date: date.getDate(),
        isPeriod: [3, 4, 5, 6, 7].includes(date.getDate()) || [24, 25, 26, 27, 28].includes(date.getDate()),
        isFertile: [12, 13, 14, 15, 16, 17, 18].includes(date.getDate()),
        isToday: today.toDateString() === date.toDateString(),
        isPredicted: [24, 25, 26, 27, 28].includes(date.getDate()),
      });
    }
    
    return days;
  };

  const calendarDays = viewMode === 'month' ? generateMonthDays() : generateTwoWeekDays();

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
    }
    setCurrentDate(newDate);
  };

  const getTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
      
      const endOfTwoWeeks = new Date(startOfWeek);
      endOfTwoWeeks.setDate(startOfWeek.getDate() + 13);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfTwoWeeks.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  const renderMonthView = () => (
    <div className="mb-4">
      {/* Day headers - only shown on desktop */}
      <div className="hidden sm:grid sm:grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days - 2 per row on mobile, 7 per row on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-1 sm:gap-1">
        {calendarDays.map((day) => (
          <div
            key={day.date}
            className={cn(
              "aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200 hover:scale-105",
              {
                "bg-primary text-primary-foreground font-medium shadow-sm": day.isPeriod && !day.isPredicted,
                "bg-primary/50 text-primary-foreground font-medium border-2 border-primary border-dashed": day.isPeriod && day.isPredicted,
                "bg-accent/30 text-accent-foreground": day.isFertile,
                "ring-2 ring-primary ring-offset-2": day.isToday,
                "hover:bg-muted": !day.isPeriod && !day.isFertile,
              }
            )}
          >
            {day.date}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTwoWeekView = () => (
    <div className="space-y-4 mb-4">
      {/* Week 1 */}
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-2">Week 1</div>
        {/* Day headers - hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Week 1 days */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {calendarDays.slice(0, 7).map((day, index) => (
            <div
              key={`week1-${day.date}-${index}`}
              className={cn(
                "h-24 w-full flex flex-col items-start justify-start p-2 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border",
                {
                  "bg-primary text-primary-foreground font-medium shadow-sm": day.isPeriod && !day.isPredicted,
                  "bg-primary/50 text-primary-foreground font-medium border-2 border-primary border-dashed": day.isPeriod && day.isPredicted,
                  "bg-accent/30 text-accent-foreground": day.isFertile,
                  "ring-2 ring-primary ring-offset-2": day.isToday,
                  "hover:bg-muted": !day.isPeriod && !day.isFertile,
                  "bg-card": !day.isPeriod && !day.isFertile && !day.isToday,
                }
              )}
            >
              <div className="font-semibold mb-1">{day.date}</div>
              
              {/* Icon containers - up to 10 icons in 2 rows */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-wrap gap-1">
                  {/* Mock data for demonstration */}
                  {day.isPeriod && <span className="text-xs bg-background/20 rounded px-1">💧</span>}
                  {day.isFertile && <span className="text-xs bg-background/20 rounded px-1">🔥</span>}
                  {index % 3 === 0 && <span className="text-xs bg-background/20 rounded px-1">😊</span>}
                  {index % 4 === 0 && <span className="text-xs bg-background/20 rounded px-1">⚡️4</span>}
                  {index % 5 === 0 && <span className="text-xs bg-background/20 rounded px-1">🌙3</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {index % 6 === 0 && <span className="text-xs bg-background/20 rounded px-1">🏋️</span>}
                  {index % 7 === 0 && <span className="text-xs bg-background/20 rounded px-1">💊</span>}
                  {index % 2 === 0 && <span className="text-xs bg-background/20 rounded px-1">🦵🏅</span>}
                  {index % 3 === 0 && <span className="text-xs bg-background/20 rounded px-1">💥2</span>}
                  {index % 4 === 0 && <span className="text-xs bg-background/20 rounded px-1">🫁1</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week 2 */}
      <div>
        <div className="text-sm font-medium text-muted-foreground mb-2">Week 2</div>
        {/* Day headers - hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Week 2 days */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {calendarDays.slice(7, 14).map((day, index) => (
            <div
              key={`week2-${day.date}-${index}`}
              className={cn(
                "h-24 w-full flex flex-col items-start justify-start p-2 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border",
                {
                  "bg-primary text-primary-foreground font-medium shadow-sm": day.isPeriod && !day.isPredicted,
                  "bg-primary/50 text-primary-foreground font-medium border-2 border-primary border-dashed": day.isPeriod && day.isPredicted,
                  "bg-accent/30 text-accent-foreground": day.isFertile,
                  "ring-2 ring-primary ring-offset-2": day.isToday,
                  "hover:bg-muted": !day.isPeriod && !day.isFertile,
                  "bg-card": !day.isPeriod && !day.isFertile && !day.isToday,
                }
              )}
            >
              <div className="font-semibold mb-1">{day.date}</div>
              
              {/* Icon containers - up to 10 icons in 2 rows */}
              <div className="flex flex-col gap-1 w-full">
                <div className="flex flex-wrap gap-1">
                  {/* Mock data for demonstration */}
                  {day.isPeriod && <span className="text-xs bg-background/20 rounded px-1">💧</span>}
                  {day.isFertile && <span className="text-xs bg-background/20 rounded px-1">🔥</span>}
                  {(index + 7) % 3 === 0 && <span className="text-xs bg-background/20 rounded px-1">😊</span>}
                  {(index + 7) % 4 === 0 && <span className="text-xs bg-background/20 rounded px-1">⚡️4</span>}
                  {(index + 7) % 5 === 0 && <span className="text-xs bg-background/20 rounded px-1">🌙3</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(index + 7) % 6 === 0 && <span className="text-xs bg-background/20 rounded px-1">🏋️</span>}
                  {(index + 7) % 7 === 0 && <span className="text-xs bg-background/20 rounded px-1">💊</span>}
                  {(index + 7) % 2 === 0 && <span className="text-xs bg-background/20 rounded px-1">🦵🏅</span>}
                  {(index + 7) % 3 === 0 && <span className="text-xs bg-background/20 rounded px-1">💥2</span>}
                  {(index + 7) % 4 === 0 && <span className="text-xs bg-background/20 rounded px-1">🫁1</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-gradient-card shadow-soft border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center justify-center">
          <div className="flex rounded-lg bg-muted p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8 px-3"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === 'twoWeek' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('twoWeek')}
              className="h-8 px-3"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              2 Week
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderTwoWeekView()}

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span>Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/50 border-2 border-primary border-dashed rounded" />
            <span>Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/30 rounded" />
            <span>Fertile window</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 ring-2 ring-primary rounded" />
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CycleCalendar;