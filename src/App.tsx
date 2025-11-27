import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { SupplementReminder } from "@/components/SupplementReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import AIChatCoach from "@/components/AIChatCoach";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import TwoFactorVerification from "./pages/TwoFactorVerification";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Calendar from "./pages/Calendar";
import CalendarDay from "./pages/CalendarDay";
import Training from "./pages/Training";
import Symptoms from "./pages/Symptoms";
import Education from "./pages/Education";
import EducationDetail from "./pages/EducationDetail";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import Shop from "./pages/Shop";
import Chat from "./pages/Chat";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ConditionalAIChatCoach = () => {
  const location = useLocation();
  const showAIChat = location.pathname.startsWith('/dashboard') && location.pathname !== '/dashboard/chat';
  
  return showAIChat ? <AIChatCoach /> : null;
};

const SupplementReminderWrapper = () => {
  const { showReminder, hideReminder } = useNotifications();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  if (!isDashboard || !showReminder) return null;
  
  return <SupplementReminder onClose={hideReminder} onTaken={hideReminder} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/2fa-verification" element={<TwoFactorVerification />} />
            <Route path="/install" element={<Install />} />
            <Route path="/dashboard/overview" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard/calendar" element={<Calendar />} />
            <Route path="/dashboard/calendar/:dayId" element={<CalendarDay />} />
            <Route path="/dashboard/training" element={<Training />} />
            <Route path="/dashboard/symptoms" element={<Symptoms />} />
            <Route path="/dashboard/education" element={<Education />} />
            <Route path="/dashboard/education/:id" element={<EducationDetail />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/goals" element={<Goals />} />
            <Route path="/dashboard/shop" element={<Shop />} />
            <Route path="/dashboard/chat" element={<Chat />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ConditionalAIChatCoach />
          <SupplementReminderWrapper />
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
