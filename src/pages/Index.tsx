import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Calendar, Droplets, TrendingUp, Sparkles, Shield, Zap, Award, ChevronLeft, ChevronRight, Menu, X, Star, ArrowRight, Plus, Minus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/Logo";
import SocialProof from "@/components/ui/demo";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import avatarWoman1 from "@/assets/avatar-woman-1.jpg";
import avatarWoman2 from "@/assets/avatar-woman-2.jpg";
import avatarWoman3 from "@/assets/avatar-woman-3.jpg";
import avatarWoman4 from "@/assets/avatar-woman-4.jpg";
import heroSlide1 from "@/assets/hero-slider-1.jpg";
import heroSlide2 from "@/assets/hero-slider-2.jpg";
import heroSlide3 from "@/assets/hero-slider-3.jpg";
import ipadMockup from "@/assets/ipad-mockup.jpg";
import ctaBackground from "@/assets/cta-background.jpg";

const heroSlides = [
  {
    image: heroSlide1,
    title: "Track Your Cycle, Ease Your",
    subtitle: "Finally understand your body's patterns and manage discomfort naturally",
    highlight: "Pain"
  },
  {
    image: heroSlide2,
    title: "Natural Relief for Your",
    subtitle: "Premium supplements designed for women's menstrual health",
    highlight: "Journey"
  },
  {
    image: heroSlide3,
    title: "Predict and Prevent Your",
    subtitle: "Smart insights to help you prepare and minimize symptoms",
    highlight: "Discomfort"
  }
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Executive",
    rating: 5,
    text: "Fourmula has completely transformed how I manage my cycle. The pain predictions are incredibly accurate!",
    image: avatarWoman1
  },
  {
    name: "Jessica Chen",
    role: "Fitness Instructor",
    rating: 5,
    text: "I wish I had found this app years ago. My menstrual pain is finally manageable.",
    image: avatarWoman2
  },
  {
    name: "Maria Rodriguez",
    role: "Software Engineer",
    rating: 5,
    text: "The supplements work amazingly well. I can actually function normally during my period now.",
    image: avatarWoman3
  },
  {
    name: "Dr. Emily Johnson",
    role: "Healthcare Professional",
    rating: 5,
    text: "As a healthcare professional, I'm impressed by the science behind this approach.",
    image: avatarWoman4
  },
  {
    name: "Lisa Thompson",
    role: "Teacher",
    rating: 5,
    text: "My students don't even know when it's 'that time of the month' anymore - life-changing!",
    image: avatarWoman1
  },
  {
    name: "Anna Wilson",
    role: "Business Owner",
    rating: 5,
    text: "Running my business is so much easier when I can predict and prepare for my cycle.",
    image: avatarWoman2
  }
];

const faqs = [
  {
    question: "How accurate is the cycle prediction?",
    answer: "Our AI-powered predictions are 95% accurate after tracking for just 2-3 cycles. The more you track, the more accurate it becomes."
  },
  {
    question: "Are the supplements safe and natural?",
    answer: "Yes, all our supplements are made with natural ingredients, third-party tested for purity, and formulated specifically for women's menstrual health."
  },
  {
    question: "Can this help with severe menstrual pain?",
    answer: "Many users report significant reduction in menstrual pain. However, we always recommend consulting with your healthcare provider for severe symptoms."
  },
  {
    question: "How long before I see results?",
    answer: "Most users notice improvements in cycle tracking immediately, while supplement benefits typically appear within 1-2 cycles of consistent use."
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. Your data is encrypted and never shared with third parties. We believe your menstrual health information is deeply personal."
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    navigate('/auth');
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setProgress(0);
    }, 7000);
    
    const progressTimer = setInterval(() => {
      setProgress(prev => prev + (100 / 70));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [currentSlide]);

  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(testimonialTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-bg-soft">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 100 
          ? 'bg-white/95 backdrop-blur-md border-b border-primary/10' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Logo size="sm" className="sm:hidden" />
            <Logo size="md" className="hidden sm:block" />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <a href="#features" className="transition-colors font-medium text-sm text-foreground hover:text-primary">
                Features
              </a>
              <a href="#how-it-works" className="transition-colors font-medium text-sm text-foreground hover:text-primary">
                How It Works
              </a>
              <a href="#testimonials" className="transition-colors font-medium text-sm text-foreground hover:text-primary">
                Reviews
              </a>
              <a href="#faq" className="transition-colors font-medium text-sm text-foreground hover:text-primary">
                FAQ
              </a>
              {scrollY > 100 ? (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="font-medium text-xs px-4" onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                  <Button size="sm" className="gradient-bg hover:shadow-glow font-medium text-xs px-4" onClick={() => window.location.href = '/auth'}>
                    Start Free
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 font-medium backdrop-blur-sm text-xs px-4" onClick={() => window.location.href = '/auth'}>
                    Sign In
                  </Button>
                  <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-medium shadow-lg text-xs px-4" onClick={() => window.location.href = '/auth'}>
                    Start Free
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <SheetTrigger asChild>
                <button className={`lg:hidden p-2 rounded-full transition-all ${
                  scrollY > 100 ? 'bg-primary' : 'bg-primary'
                }`}>
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 bg-white">
                <div className="flex flex-col h-full pt-12">
                  <div className="flex flex-col gap-6 mb-8">
                    <a 
                      href="#features" 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Features
                    </a>
                    <a 
                      href="#how-it-works" 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      How It Works
                    </a>
                    <a 
                      href="#testimonials" 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      Reviews
                    </a>
                    <a 
                      href="#faq" 
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 border-b border-gray-100"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      FAQ
                    </a>
                  </div>
                  
                  <div className="flex flex-col gap-4 mt-auto mb-8">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full font-medium text-base py-4"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        window.location.href = '/auth';
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      size="lg" 
                      className="w-full gradient-bg hover:shadow-glow font-medium text-base py-4"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        window.location.href = '/auth';
                      }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Free
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Marquee */}
      <AnimatedMarqueeHero
        tagline="Join over 100,000+ women taking control of their cycle"
        title={
          <>
            Track Your Cycle,
            <br />
            <span className="font-serif font-thin italic">Ease Your Pain</span>
          </>
        }
        description="Finally understand your body's patterns and manage discomfort naturally with AI-powered predictions and clinically-backed natural supplements."
        ctaText="Start Your Free Journey"
        onCtaClick={() => window.location.href = '/auth'}
        images={[
          heroSlide1,
          heroSlide2,
          heroSlide3,
          avatarWoman1,
          avatarWoman2,
          avatarWoman3,
          avatarWoman4,
          heroSlide1,
          heroSlide2,
          heroSlide3,
        ]}
      />

      {/* Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div className="py-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">95%</div>
              <div className="text-muted-foreground text-xs sm:text-sm">Prediction Accuracy</div>
            </div>
            <div className="py-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">50K+</div>
              <div className="text-muted-foreground text-xs sm:text-sm">Women Helped</div>
            </div>
            <div className="py-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">87%</div>
              <div className="text-muted-foreground text-xs sm:text-sm">Pain Reduction</div>
            </div>
            <div className="py-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">4.9★</div>
              <div className="text-muted-foreground text-xs sm:text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-24 bg-gradient-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Your Complete Wellness Toolkit</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
              Everything You Need for Menstrual <span className="font-serif italic font-thin">Wellness</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed px-4">
              Comprehensive tools and supplements designed specifically to help women understand and manage their menstrual health with confidence.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white shadow-soft border-0 text-center p-4 sm:p-6 lg:p-8 hover-scale group">
              <CardContent className="pt-4 sm:pt-6 lg:pt-8">
                <div className="p-4 sm:p-5 lg:p-6 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Smart Cycle Tracking</h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                  AI-powered predictions that learn from your unique patterns to forecast periods, symptoms, and optimal timing for everything.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-0 text-center p-4 sm:p-6 lg:p-8 hover-scale group">
              <CardContent className="pt-4 sm:pt-6 lg:pt-8">
                <div className="p-4 sm:p-5 lg:p-6 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Natural Pain Relief</h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                  Clinically-tested supplements formulated specifically to reduce menstrual pain and support hormonal balance naturally.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-soft border-0 text-center p-4 sm:p-6 lg:p-8 hover-scale group md:col-span-2 lg:col-span-1">
              <CardContent className="pt-4 sm:pt-6 lg:pt-8">
                <div className="p-4 sm:p-5 lg:p-6 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Personal Insights</h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                  Discover your unique patterns with beautiful analytics and receive personalized recommendations for your wellness journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Simple 3-Step Process</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
              How Fourmula Changes Your <span className="font-serif italic font-thin">Life</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-4xl mx-auto px-4">
              Simple steps to transform how you experience your menstrual cycle
            </p>
          </div>

          <div className="grid gap-8 sm:gap-10 md:grid-cols-3 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6">
                <span className="text-xl sm:text-xl lg:text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 lg:mb-4">Track Your Cycle</h3>
              <p className="text-muted-foreground text-sm sm:text-base px-2">Log your periods, symptoms, and mood for just 2-3 cycles to establish your unique pattern.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6">
                <span className="text-xl sm:text-xl lg:text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 lg:mb-4">Get Predictions</h3>
              <p className="text-muted-foreground text-sm sm:text-base px-2">Receive accurate forecasts for your next period, symptoms, and optimal times for activities.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6">
                <span className="text-xl sm:text-xl lg:text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 lg:mb-4">Feel Better</h3>
              <p className="text-muted-foreground text-sm sm:text-base px-2">Use our natural supplements and insights to minimize pain and maximize your well-being.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview with iPad Mockup */}
      <section className="py-12 sm:py-16 lg:py-24 bg-gradient-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Intuitive Design</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
              Your Personal Wellness <span className="font-serif italic font-thin">Dashboard</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-3xl mx-auto px-4">
              Beautiful, intuitive interface that makes tracking your cycle as simple as checking the weather.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full max-w-sm sm:max-w-md mx-auto grid-cols-3 mb-6 sm:mb-8 lg:mb-12">
                <TabsTrigger value="calendar" className="text-xs sm:text-sm font-medium p-2 sm:p-3">Calendar</TabsTrigger>
                <TabsTrigger value="tracking" className="text-xs sm:text-sm font-medium p-2 sm:p-3">Daily Log</TabsTrigger>
                <TabsTrigger value="insights" className="text-xs sm:text-sm font-medium p-2 sm:p-3">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="mt-0">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2">Smart Calendar</h3>
                  <p className="text-muted-foreground text-sm sm:text-base px-2">Visualize your cycle patterns and predictions</p>
                </div>
                <img 
                  src={ipadMockup} 
                  alt="Fourmula calendar view showing cycle tracking"
                  className="w-full h-auto drop-shadow-2xl rounded-2xl"
                />
              </TabsContent>
              
              <TabsContent value="tracking" className="mt-0">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2">Daily Tracking</h3>
                  <p className="text-muted-foreground text-sm sm:text-base px-2">Log symptoms, moods, and activities effortlessly</p>
                </div>
                <img 
                  src={ipadMockup} 
                  alt="Fourmula daily tracking interface"
                  className="w-full h-auto drop-shadow-2xl rounded-2xl"
                />
              </TabsContent>
              
              <TabsContent value="insights" className="mt-0">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-1 sm:mb-2">Personal Insights</h3>
                  <p className="text-muted-foreground text-sm sm:text-base px-2">Discover patterns and optimize your wellness</p>
                </div>
                <img 
                  src={ipadMockup} 
                  alt="Fourmula insights and analytics dashboard"
                  className="w-full h-auto drop-shadow-2xl rounded-2xl"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-gradient-primary text-white p-6 sm:p-8 lg:p-12 rounded-3xl relative overflow-hidden border-2 sm:border-4 border-primary/20">
              <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-t-2 border-l-2 sm:border-t-4 sm:border-l-4 border-white/30 rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-t-2 border-r-2 sm:border-t-4 sm:border-r-4 border-white/30 rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-b-2 border-l-2 sm:border-b-4 sm:border-l-4 border-white/30 rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border-b-2 border-r-2 sm:border-b-4 sm:border-r-4 border-white/30 rounded-br-3xl"></div>
              
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <p className="text-white/80 font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Trusted by Thousands</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
                  Why Women Choose <span className="font-serif italic font-thin">Fourmula</span>
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-4xl mx-auto px-4">
                  Join thousands of women who have transformed their relationship with their menstrual cycle
                </p>
              </div>

              <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/10 rounded-2xl w-fit mx-auto mb-3 sm:mb-4 lg:mb-6 backdrop-blur-sm">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Predictable Relief</h3>
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base px-2">
                    Know exactly when symptoms will arrive and prepare accordingly with our accurate predictions and natural supplements.
                  </p>
                </div>

                <div className="text-center">
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/10 rounded-2xl w-fit mx-auto mb-3 sm:mb-4 lg:mb-6 backdrop-blur-sm">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Complete Privacy</h3>
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base px-2">
                    Your most personal health data is encrypted and secured. We believe your cycle information should stay yours.
                  </p>
                </div>

                <div className="text-center md:col-span-3 lg:col-span-1">
                  <div className="p-4 sm:p-5 lg:p-6 bg-white/10 rounded-2xl w-fit mx-auto mb-3 sm:mb-4 lg:mb-6 backdrop-blur-sm">
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 lg:mb-4">Clinically Backed</h3>
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base px-2">
                    Our approach is based on peer-reviewed research and has helped over 50,000 women manage their cycles better.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-24 bg-gradient-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Success Stories</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
              Real Women, Real <span className="font-serif italic font-thin">Results</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              See how Fourmula has transformed the lives of women just like you
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-soft overflow-hidden hover-scale">
                <CardContent className="p-0">
                  <div className="h-40 sm:h-48 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Button variant="outline" size="lg" className="font-medium text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
              Read More Reviews
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Got Questions?</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2">
              Frequently Asked <span className="font-serif italic font-thin">Questions</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4">
              Everything you need to know about Fourmula
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible key={index}>
                <Card className="bg-white border-0 shadow-soft">
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 sm:p-5 lg:p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <h3 className="text-base sm:text-lg font-semibold pr-4">{faq.question}</h3>
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 sm:px-5 sm:pb-5 lg:px-6 lg:pb-6">
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Background Image */}
      <section className="py-16 sm:py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={ctaBackground} 
            alt="Women wellness transformation background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 text-center text-white">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/90 font-semibold mb-3 sm:mb-4 lg:mb-6 text-sm sm:text-base lg:text-lg tracking-wider uppercase">Join Thousands of Happy Women</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight px-2">
              Ready to Transform Your <span className="font-serif italic font-thin">Cycle?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 text-white/95 leading-relaxed max-w-5xl mx-auto px-4">
              Join over 50,000 women who have taken control of their menstrual health. 
              Start your free journey today and experience the difference.
            </p>
            
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 justify-center mb-8 sm:mb-10 lg:mb-12 px-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 transition-all text-base sm:text-lg lg:text-xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 rounded-2xl font-bold shadow-2xl hover:shadow-glow hover:scale-105 w-full sm:w-auto"
                onClick={() => window.location.href = '/auth'}
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
                Start Your Free Journey
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ml-2 sm:ml-3" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 sm:border-3 border-white/40 text-white hover:bg-white/10 text-base sm:text-lg lg:text-xl px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 rounded-2xl font-bold backdrop-blur-sm hover:scale-105 transition-all w-full sm:w-auto"
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-white/90 px-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">No credit card required</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">Free forever plan</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-medium text-sm sm:text-base">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 lg:py-16 bg-foreground text-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-5 mb-8 sm:mb-10 lg:mb-12">
            <div className="md:col-span-3 lg:col-span-2">
              <div className="mb-4 sm:mb-6">
                <Logo size="md" className="sm:hidden" />
                <Logo size="lg" className="hidden sm:block" />
              </div>
              <p className="text-background/80 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Empowering women to take control of their menstrual health through smart tracking, natural supplements, and personalized insights.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-background/10 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Product</h3>
              <div className="space-y-2 sm:space-y-3 text-background/80 text-sm sm:text-base">
                <div>Cycle Tracking</div>
                <div>Pain Management</div>
                <div>Natural Supplements</div>
                <div>Health Insights</div>
                <div>Predictions</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Company</h3>
              <div className="space-y-2 sm:space-y-3 text-background/80 text-sm sm:text-base">
                <div>About Us</div>
                <div>Our Science</div>
                <div>Blog & Resources</div>
                <div>Careers</div>
                <div>Contact</div>
              </div>
            </div>
            
            <div className="md:col-span-3 lg:col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Support</h3>
              <div className="space-y-2 sm:space-y-3 text-background/80 text-sm sm:text-base">
                <div>Help Center</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Data Security</div>
                <div>Accessibility</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 pt-6 sm:pt-8 flex flex-col gap-4 md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-background/60 text-xs sm:text-sm">
              &copy; 2024 Fourmula. All rights reserved. Made with ❤️ for women's health.
            </p>
            <p className="text-background/60 text-xs sm:text-sm">
              Clinically tested • FDA approved facilities • 60-day money-back guarantee
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;