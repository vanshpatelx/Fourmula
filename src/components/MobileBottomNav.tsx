import { NavLink } from 'react-router-dom';
import { Calendar, Plus, Home, ShoppingBag, Bot, Dumbbell, Heart } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MobileBottomNav = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const quickActions = [
    { 
      icon: ShoppingBag, 
      label: 'Shop', 
      path: '/dashboard/shop',
      type: 'nav'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      path: '/dashboard/calendar', 
      type: 'nav' 
    },
    { 
      icon: Plus, 
      label: 'Add Log', 
      type: 'add',
      className: 'bg-gradient-to-t from-primary to-primary/80 text-white shadow-xl scale-105 border-2 border-white/20'
    },
    { 
      icon: Home, 
      label: 'Home', 
      path: '/dashboard', 
      type: 'nav' 
    },
    { 
      icon: Bot, 
      label: 'AI Chat', 
      path: '/dashboard/chat',
      type: 'nav'
    },
  ];

  const allNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Calendar', path: '/dashboard/calendar', icon: '📅' },
    { label: 'Wellness Log', path: '/dashboard/symptoms', icon: '❤️' },
    { label: 'Training', path: '/dashboard/training', icon: '💪' },
    { label: 'Shop', path: '/dashboard/shop', icon: '🛍️' },
    { label: 'Education', path: '/dashboard/education', icon: '📚' },
    { label: 'Goals', path: '/dashboard/goals', icon: '🎯' },
    { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
  ];

  const handleItemClick = (item: any) => {
    if (item.type === 'chat') {
      setIsAIChatOpen(true);
    } else if (item.type === 'add') {
      setIsAddMenuOpen(true);
    }
  };

  return (
    <>
      {/* Minimalist Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#a78bfa] border-t border-purple-400/30 px-4 py-1.5 z-50 md:hidden rounded-t-xl shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {quickActions.map((item, index) => {
            if (item.type === 'nav') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex flex-col items-center py-1 px-2 transition-colors duration-200 relative ${
                      isActive
                        ? 'text-white'
                        : 'text-white/70'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  {/* Active indicator dot */}
                  <div className={`w-1 h-1 rounded-full mt-0.5 transition-opacity ${
                    window.location.pathname === item.path ? 'bg-white opacity-100' : 'opacity-0'
                  }`} />
                </NavLink>
              );
            } else if (item.type === 'add') {
              return (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={() => handleItemClick(item)}
                  className="flex flex-col items-center py-1 px-2 h-auto hover:bg-transparent relative"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-[#a78bfa]">
                    <item.icon className="w-5 h-5 text-[#a78bfa]" strokeWidth={2} />
                  </div>
                  <div className="w-1 h-1 rounded-full mt-0.5 opacity-0" />
                </Button>
              );
            }
          })}
        </div>
      </nav>

      {/* Add Log Selection Popup */}
      <Sheet open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl bg-background border-0">
          <div className="py-6 px-4">
            {/* Minimalist handle */}
            <div className="w-16 h-1.5 bg-muted rounded-full mx-auto mb-6" />
            
            {/* Clean title */}
            <h3 className="text-lg font-semibold mb-6 text-center text-foreground">Add New Entry</h3>
            
            {/* Selection cards */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  window.location.href = '/dashboard/symptoms';
                }}
              >
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium text-foreground mb-2">Symptoms</h4>
                  <p className="text-sm text-muted-foreground">Log your wellness symptoms</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  window.location.href = '/dashboard/training';
                }}
              >
                <CardContent className="p-6 text-center">
                  <Dumbbell className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium text-foreground mb-2">Training</h4>
                  <p className="text-sm text-muted-foreground">Add your workout session</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Clean AI Chat Modal */}
      <Sheet open={isAIChatOpen} onOpenChange={setIsAIChatOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl bg-background">
          <div className="flex flex-col h-full">
            <div className="py-4 border-b border-border">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">AI Wellness Coach</h3>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-accent/20">
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-xl border border-border">
                  <p className="text-sm text-foreground">
                    👋 Hi! I'm your AI wellness coach. How can I help you today?
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto text-xs p-3 rounded-xl bg-background border-border hover:bg-accent/50"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">💭</div>
                      <div>How are you feeling?</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto text-xs p-3 rounded-xl bg-background border-border hover:bg-accent/50"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🩸</div>
                      <div>Period tracking</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto text-xs p-3 rounded-xl bg-background border-border hover:bg-accent/50"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🏃‍♀️</div>
                      <div>Exercise tips</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto text-xs p-3 rounded-xl bg-background border-border hover:bg-accent/50"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🥗</div>
                      <div>Nutrition advice</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-background">
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                />
                <Button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileBottomNav;