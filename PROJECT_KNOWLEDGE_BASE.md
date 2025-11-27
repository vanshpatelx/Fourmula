# Menstrual Mate - Complete Project Knowledge Base

## Project Overview
**Name:** Menstrual Mate  
**Purpose:** A comprehensive menstrual health and wellness tracking application that helps women track their cycles, symptoms, training, and overall wellness journey.

**Core Value Proposition:** Personalized cycle-based insights for optimizing training, nutrition, and wellness based on menstrual phase data.

## Tech Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** Shadcn/ui component library
- **Icons:** Lucide React
- **Routing:** React Router DOM 6.30.1
- **Forms:** React Hook Form with Zod validation
- **Date Handling:** date-fns
- **Charts:** Recharts
- **Notifications:** Sonner (toast notifications)

### Backend
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Real-time:** Supabase Realtime subscriptions

### Key Dependencies
```json
{
  "@supabase/supabase-js": "^2.56.0",
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "tailwind-merge": "^2.6.0",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.462.0",
  "date-fns": "^3.6.0",
  "recharts": "^2.15.4",
  "sonner": "^1.7.4"
}
```

## Database Schema

### Core Tables

#### 1. profiles
```sql
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  birth_year INTEGER,
  cycle_irregular BOOLEAN DEFAULT false,
  contraception_type TEXT,
  region TEXT DEFAULT 'Europe/London',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. cycle_baselines
```sql
CREATE TABLE public.cycle_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  avg_cycle_len INTEGER NOT NULL,
  luteal_len INTEGER DEFAULT 14,
  last_period_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. cycle_events
```sql
CREATE TABLE public.cycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  date DATE NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. phase_forecasts
```sql
CREATE TABLE public.phase_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  date DATE NOT NULL,
  phase TEXT,
  confidence NUMERIC
);
```

#### 5. symptom_logs
```sql
CREATE TABLE public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  date DATE NOT NULL,
  mood INTEGER,
  energy INTEGER,
  sleep INTEGER,
  cramps INTEGER,
  bloating INTEGER,
  training_load INTEGER,
  headache BOOLEAN DEFAULT false,
  breast_tenderness BOOLEAN DEFAULT false,
  nausea BOOLEAN DEFAULT false,
  gas BOOLEAN DEFAULT false,
  toilet_issues BOOLEAN DEFAULT false,
  hot_flushes BOOLEAN DEFAULT false,
  chills BOOLEAN DEFAULT false,
  stress_headache BOOLEAN DEFAULT false,
  dizziness BOOLEAN DEFAULT false,
  ovulation BOOLEAN DEFAULT false,
  bleeding_flow TEXT,
  mood_states TEXT[],
  craving_types TEXT[],
  cravings TEXT,
  notes TEXT
);
```

#### 6. training_logs
```sql
CREATE TABLE public.training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  date DATE NOT NULL,
  training_load TEXT,
  soreness INTEGER,
  fatigue INTEGER,
  workout_types TEXT[],
  pb_type TEXT,
  pb_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 7. adherence_logs
```sql
CREATE TABLE public.adherence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  taken BOOLEAN DEFAULT false,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 8. adherence_goals
```sql
CREATE TABLE public.adherence_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_days INTEGER DEFAULT 30,
  target_streak INTEGER DEFAULT 7,
  training_goal_days INTEGER DEFAULT 3,
  reminder_time TIME,
  active BOOLEAN DEFAULT true,
  goal_type TEXT DEFAULT 'daily_supplement',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 9. chat_conversations
```sql
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies
All tables have Row Level Security enabled with policies that ensure users can only access their own data:
- `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE operations

## Design System

### Color Palette (HSL Format)
```css
/* index.css */
:root {
  /* Primary Brand Colors */
  --primary: 340 82% 52%;           /* Pink/Rose primary */
  --primary-foreground: 0 0% 98%;
  --primary-glow: 340 82% 65%;
  
  /* Secondary Colors */
  --secondary: 210 40% 98%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Background System */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Card System */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Borders & Inputs */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 340 82% 52%;
  
  /* Destructive (Errors) */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* Custom Gradients */
  --gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)));
  --gradient-soft: linear-gradient(135deg, hsl(210, 40%, 98%), hsl(220, 13%, 95%));
  --gradient-card: linear-gradient(145deg, hsl(0, 0%, 100%), hsl(210, 40%, 98%));
  
  /* Custom Shadows */
  --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 20px hsl(var(--primary) / 0.3);
}

/* Dark Mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 340 82% 52%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
}
```

### Typography
- **Font Family:** Default system fonts (no custom fonts)
- **Font Scale:** Tailwind's default scale (text-sm, text-base, text-lg, etc.)
- **Font Weights:** 
  - Regular (400) for body text
  - Medium (500) for labels
  - Semibold (600) for emphasis
  - Bold (700) for headings

### Component Design Patterns
- **Cards:** `bg-gradient-card shadow-soft border-0` for consistent elevation
- **Buttons:** Primary uses `bg-gradient-primary hover:shadow-glow`
- **Inputs:** Clean minimal styling with focus rings
- **Gradients:** Subtle backgrounds using CSS custom properties

## Application Architecture

### File Structure
```
src/
├── components/
│   ├── ui/           # Shadcn/ui components
│   ├── AIChatCoach.tsx
│   ├── AppSidebar.tsx
│   ├── CycleCalendar.tsx
│   ├── CycleTracker.tsx
│   ├── DashboardLayout.tsx
│   ├── Logo.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Auth.tsx
│   ├── Calendar.tsx
│   ├── CalendarDay.tsx
│   ├── Dashboard.tsx
│   ├── Education.tsx
│   ├── Goals.tsx
│   ├── Index.tsx
│   ├── NotFound.tsx
│   ├── Onboarding.tsx
│   ├── Settings.tsx
│   ├── Symptoms.tsx
│   └── Training.tsx
├── hooks/
│   ├── useAuth.tsx
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/supabase/
│   ├── client.ts
│   └── types.ts
├── lib/
│   └── utils.ts
└── utils/
    └── backgroundRemoval.ts
```

### Routing Configuration
```tsx
// In App.tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />
  <Route path="/onboarding" element={<Onboarding />} />
  <Route path="/dashboard/overview" element={<Dashboard />} />
  <Route path="/dashboard/calendar" element={<Calendar />} />
  <Route path="/dashboard/calendar/:date" element={<CalendarDay />} />
  <Route path="/dashboard/symptoms" element={<Symptoms />} />
  <Route path="/dashboard/training" element={<Training />} />
  <Route path="/dashboard/education" element={<Education />} />
  <Route path="/dashboard/goals" element={<Goals />} />
  <Route path="/dashboard/settings" element={<Settings />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Core Features & Functionality

### 1. Authentication System
- **Provider:** Supabase Auth
- **Implementation:** Custom `useAuth` hook
- **Protected Routes:** `ProtectedRoute` wrapper component
- **Auto-redirect:** Unauthenticated users redirected to `/auth`

### 2. Dashboard Layout System
- **Sidebar Navigation:** Collapsible sidebar with icons and labels
- **Consistent Headers:** Clean white headers with page titles and descriptions
- **Responsive Design:** Mobile-friendly sidebar behavior

### 3. Cycle Tracking
#### Phase Calculation Logic:
- **Menstrual:** Days 1-5 of cycle
- **Follicular:** Days 6-13
- **Ovulatory:** Days 14-16
- **Luteal:** Days 17+ until next cycle

#### Cycle Calendar Features:
- Visual cycle overview with color-coded phases
- Event logging (period start/end)
- Phase forecasting based on user baselines

### 4. Symptom Logging
#### Tracked Metrics:
- **Sliders (1-5):** Mood, Energy, Sleep Quality, Cramps, Bloating
- **Toggle Switches:** 10+ physical symptoms
- **Multi-select:** Mood states, food cravings
- **Text Input:** Additional notes
- **Bleeding Flow:** Light/Medium/Heavy options

### 5. Training Log
#### Workout Tracking:
- **Training Load:** Slider input
- **Physical Metrics:** Soreness, Fatigue (1-5 scale)
- **Workout Types:** Multi-select (Strength, Cardio, Yoga, etc.)
- **Personal Bests:** Type and value tracking
- **Training Notes:** Free-text field

### 6. Education System
#### Content Structure:
- **Current Phase Display:** Shows user's active cycle phase
- **Phase-Specific Guidance:** 
  - Nutrition recommendations
  - Training advice
  - Supplement suggestions
  - General tips
- **All Phases Overview:** Educational cards for each phase
- **Product Information:** About Fourmula supplements

### 7. Goals & Adherence
#### Goal Types:
- **Supplement Target:** Days per month
- **Streak Goal:** Consecutive days
- **Training Goals:** Days per week
- **Daily Reminders:** Customizable time

#### Tracking Features:
- Streak counting
- Weekly progress visualization
- Goal achievement notifications

### 8. AI Chat Coach
#### Integration:
- OpenAI GPT integration via Supabase Edge Function
- Conversation history persistence
- Context-aware responses about cycle and health

## Supabase Edge Functions

### 1. ai-chat (AI Coach)
```typescript
// Function: ai-chat
// Purpose: OpenAI integration for personalized health coaching
// Input: User message, conversation history
// Output: AI-generated health advice and responses
```

### 2. cycle-add-event
```typescript
// Function: cycle-add-event
// Purpose: Add cycle events (period start/end)
// Input: User ID, date, event type
// Output: Success/error response
```

### 3. cycle-undo-last
```typescript
// Function: cycle-undo-last
// Purpose: Undo the last cycle event
// Input: User ID
// Output: Success/error response
```

### 4. mark-taken
```typescript
// Function: mark-taken
// Purpose: Log supplement adherence
// Input: User ID, date, taken status
// Output: Updated streak count
```

### 5. rebuild-forecast
```typescript
// Function: rebuild-forecast
// Purpose: Regenerate cycle phase forecasts
// Input: User ID, cycle baseline data
// Output: Updated phase predictions
```

### 6. schedule-reminders
```typescript
// Function: schedule-reminders
// Purpose: Set up daily supplement reminders
// Input: User ID, reminder preferences
// Output: Scheduled reminder confirmation
```

## Component Documentation

### Layout Components

#### DashboardLayout
```tsx
interface DashboardLayoutProps {
  children: React.ReactNode;
}
// Provides: Sidebar navigation + main content area
// Usage: Wraps all dashboard pages
```

#### AppSidebar
```tsx
// Features:
// - Collapsible sidebar with SidebarProvider
// - Icon-based navigation with labels
// - Active route highlighting with NavLink
// - User profile section at bottom
```

#### ProtectedRoute
```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
}
// Features:
// - Authentication check with useAuth
// - Loading state display
// - Auto-redirect to /auth if not authenticated
```

### Data Components

#### CycleTracker
```tsx
// Features:
// - Visual cycle progress display
// - Current phase highlighting
// - Days until next phase
// - Supplement reminder integration
```

#### CycleCalendar
```tsx
// Features:
// - Month view calendar
// - Phase color coding
// - Event markers
// - Interactive date selection
```

### Form Components
All form pages follow consistent patterns:
- Date navigation with chevron buttons
- Card-based form sections
- Slider components with emoji feedback
- Multi-select button groups
- Save functionality with loading states
- Toast notifications for success/error

## Styling Conventions

### Consistent Patterns
1. **Page Headers:**
```tsx
<div className="bg-white px-8 py-6 border-b border-gray-100">
  <div className="flex items-center space-x-3">
    <Icon className="w-6 h-6 text-primary" />
    <h1 className="text-2xl font-medium text-gray-600">
      <span className="text-gray-900 font-semibold">Page Title</span>
    </h1>
  </div>
  <p className="text-gray-500 mt-2">Page description</p>
</div>
```

2. **Content Areas:**
```tsx
<div className="p-8">
  <div className="container mx-auto max-w-2xl">
    {/* Content here */}
  </div>
</div>
```

3. **Cards:**
```tsx
<Card className="bg-gradient-card shadow-soft border-0">
  <CardContent className="pt-6">
    {/* Card content */}
  </CardContent>
</Card>
```

### Color Usage Guidelines
- **Primary:** Used for brand elements, active states, key CTAs
- **Muted colors:** For secondary text and subtle elements  
- **Gradients:** Applied to cards and primary buttons for depth
- **Semantic colors:** Error states use destructive color system

## Data Flow Patterns

### Authentication Flow
1. User accesses protected route
2. `ProtectedRoute` checks auth status via `useAuth`
3. If unauthenticated → redirect to `/auth`
4. If authenticated → render protected content

### Data Loading Pattern
```tsx
useEffect(() => {
  if (user) {
    loadUserData();
  }
}, [user]);

const loadUserData = async () => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    setData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Data Saving Pattern
```tsx
const saveData = async () => {
  setLoading(true);
  try {
    const { error } = await supabase
      .from('table_name')
      .upsert(dataObject, { onConflict: 'user_id,date' });
    
    if (error) throw error;
    
    toast({
      title: "Success!",
      description: "Data saved successfully.",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

## Environment & Configuration

### Supabase Configuration
```typescript
// Project ID: wscbqaowafweppryqyrs
// URL: https://wscbqaowafweppryqyrs.supabase.co
// Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

export const supabase = createClient(
  'https://wscbqaowafweppryqyrs.supabase.co',
  'anon_key_here'
);
```

### Required Secrets
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Key Business Logic

### Cycle Phase Calculation
```typescript
const calculatePhase = (cycleDay: number, cycleLength: number) => {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  return 'luteal';
};
```

### Streak Calculation
```typescript
const calculateStreak = (adherenceLogs: AdherenceLog[]) => {
  // Count consecutive days from today backwards
  // Reset count on first missed day
  // Return current streak number
};
```

### Phase-Specific Content
```typescript
const phaseContent = {
  menstrual: {
    nutrition: "Focus on iron-rich foods...",
    training: "Light movement, rest...",
    supplements: "Iron, magnesium...",
    tips: "Listen to your body..."
  }
  // ... other phases
};
```

## Mobile Considerations
- Responsive design using Tailwind breakpoints
- Touch-friendly interface elements
- Sidebar collapses on mobile
- Form inputs optimized for mobile keyboards

## Performance Optimizations
- Lazy loading with React.lazy (if implemented)
- Efficient re-rendering with proper dependency arrays
- Optimized database queries with specific column selection
- Image optimization and lazy loading

## Security Features
- Row Level Security on all database tables
- User isolation via `auth.uid() = user_id` policies
- Input validation with Zod schemas
- Secure API routes via Supabase Edge Functions

## Error Handling
- Toast notifications for user feedback
- Console error logging for debugging
- Graceful degradation for network issues
- Loading states during async operations

## Deployment Configuration
- **Platform:** Lovable (lovable.dev)
- **Build:** Vite production build
- **Domain:** Custom domain support available
- **Database:** Hosted on Supabase infrastructure

---

## Recreation Instructions

To recreate this project:

1. **Setup Base Project:**
   - Create new React + TypeScript + Vite project
   - Install all dependencies listed above
   - Configure Tailwind with custom design system

2. **Setup Supabase:**
   - Create new Supabase project
   - Run all table creation SQL from schema above
   - Configure RLS policies for each table
   - Setup Edge Functions from functions directory

3. **Implement Authentication:**
   - Configure Supabase Auth
   - Create useAuth hook
   - Implement ProtectedRoute wrapper

4. **Build Layout System:**
   - Create DashboardLayout with sidebar
   - Implement consistent page headers
   - Setup routing configuration

5. **Implement Core Features:**
   - Follow component documentation above
   - Use consistent data patterns
   - Apply design system throughout

6. **Configure Integrations:**
   - Setup OpenAI API for chat
   - Configure reminder system
   - Test all Edge Functions

This documentation provides complete specifications for recreating the Menstrual Mate application with identical functionality, design, and architecture.
