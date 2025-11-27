import { Home, Calendar, Heart, Dumbbell, BookOpen, Target, Settings, User, BarChart3, ShoppingBag, Bell, Search } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navigationItems = [
  { title: "Overview", url: "/dashboard/overview", icon: Home },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Wellness", url: "/dashboard/symptoms", icon: Heart },
  { title: "Training", url: "/dashboard/training", icon: Dumbbell },
  { title: "Shop", url: "/dashboard/shop", icon: ShoppingBag },
  { title: "Education", url: "/dashboard/education", icon: BookOpen },
  { title: "Goals", url: "/dashboard/goals", icon: Target },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DesktopTopNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 bg-white rounded-lg"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  CycleSync
                </span>
                <span className="text-xs text-gray-500 font-medium">Dashboard</span>
              </div>
            </div>

            {/* Navigation Pills */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) => `
                    flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border border-primary/20" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 mr-2.5 transition-transform duration-200 group-hover:scale-110`} />
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50/80 border-gray-200/80 rounded-xl text-sm focus:bg-white focus:border-primary/40 transition-all duration-200"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 rounded-xl bg-gray-50/80 hover:bg-gray-100 border border-gray-200/50 transition-all duration-200"
            >
              <Bell className="w-4 h-4 text-gray-600" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">Welcome back</span>
                <span className="text-xs text-gray-500">contact@jp-innovate.com</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center hover:shadow-md transition-all duration-200 cursor-pointer group">
                <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}