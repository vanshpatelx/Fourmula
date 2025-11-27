import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Search, Clock, User, ExternalLink } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
  image: string;
  tags: string[];
}

const Education = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All',
    'Cycle Health', 
    'Nutrition', 
    'Training & Fitness', 
    'Hormones', 
    'Wellness',
    'Supplements'
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Understanding Your Menstrual Cycle Phases',
      excerpt: 'A comprehensive guide to the four phases of your cycle and how they affect your body, mood, and performance.',
      category: 'Cycle Health',
      readTime: '8 min read',
      author: 'Dr. Sarah Wilson',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
      tags: ['beginner', 'hormones', 'cycle tracking']
    },
    {
      id: '2',
      title: 'Nutrition Through Your Cycle: What to Eat When',
      excerpt: 'Learn how to fuel your body with the right nutrients during each phase of your menstrual cycle for optimal health.',
      category: 'Nutrition',
      readTime: '12 min read',
      author: 'Lisa Chen, RD',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop',
      tags: ['nutrition', 'meal planning', 'cycle syncing']
    },
    {
      id: '3',
      title: 'Cycle Syncing Your Workouts for Better Results',
      excerpt: 'Optimize your training by aligning your workouts with your hormonal fluctuations throughout your cycle.',
      category: 'Training & Fitness',
      readTime: '10 min read',
      author: 'Emma Rodriguez, CPT',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      tags: ['fitness', 'strength training', 'performance']
    },
    {
      id: '4',
      title: 'The Science Behind Hormonal Fluctuations',
      excerpt: 'Deep dive into estrogen, progesterone, and testosterone changes throughout your cycle and their effects.',
      category: 'Hormones',
      readTime: '15 min read',
      author: 'Dr. Michael Torres',
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=250&fit=crop',
      tags: ['science', 'hormones', 'research']
    },
    {
      id: '5',
      title: 'Managing PMS Naturally: A Holistic Approach',
      excerpt: 'Evidence-based natural strategies to reduce PMS symptoms and improve your quality of life.',
      category: 'Wellness',
      readTime: '6 min read',
      author: 'Dr. Amanda Green',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
      tags: ['PMS', 'natural remedies', 'wellness']
    },
    {
      id: '6',
      title: 'Essential Supplements for Women\'s Health',
      excerpt: 'A guide to key vitamins and minerals that support hormonal balance and overall wellness.',
      category: 'Supplements',
      readTime: '9 min read',
      author: 'Jennifer Walsh, PharmD',
      image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=250&fit=crop',
      tags: ['supplements', 'vitamins', 'health']
    },
    {
      id: '7',
      title: 'Sleep and Your Cycle: Why Rest Matters',
      excerpt: 'How your menstrual cycle affects sleep patterns and tips for better rest throughout the month.',
      category: 'Wellness',
      readTime: '7 min read',
      author: 'Dr. Rachel Kim',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop',
      tags: ['sleep', 'recovery', 'wellness']
    },
    {
      id: '8',
      title: 'Iron Deficiency and Menstruation: What You Need to Know',
      excerpt: 'Understanding the connection between heavy periods and iron deficiency, plus prevention strategies.',
      category: 'Nutrition',
      readTime: '11 min read',
      author: 'Dr. Patricia Moore',
      image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=250&fit=crop',
      tags: ['iron', 'nutrition', 'health']
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Cycle Health': 'bg-pink-100 text-pink-800',
      'Nutrition': 'bg-green-100 text-green-800',
      'Training & Fitness': 'bg-blue-100 text-blue-800',
      'Hormones': 'bg-purple-100 text-purple-800',
      'Wellness': 'bg-orange-100 text-orange-800',
      'Supplements': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Education" showSearch={true}>
        <div className="flex-1 bg-white overflow-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Mobile Header */}
            <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 pb-8">
              <div className="p-6 pt-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Education</h1>
                    <p className="text-muted-foreground">Learn and grow with expert insights</p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 rounded-2xl border-2 border-gray-200 focus:border-primary bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 -mt-4 mb-6">
              <div className="bg-white rounded-3xl p-4 border border-gray-200">
                <h3 className="font-semibold text-foreground mb-3">Categories</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="px-4 pb-32">
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/dashboard/education/${article.id}`}
                    className={`block bg-white rounded-3xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-lg active:scale-95 animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {article.readTime}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="w-3 h-3 mr-1" />
                          {article.author}
                        </div>
                        <div className="flex items-center text-primary">
                          <span className="text-sm font-medium mr-1">Read Article</span>
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between flex-shrink-0 bg-card/50 backdrop-blur-sm border-b border-border">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">Education Library</h1>
                <p className="text-muted-foreground">Expert articles on women's health, nutrition, and wellness</p>
              </div>
              <div className="flex items-center bg-card rounded-2xl px-4 py-2 border border-border shadow-sm min-w-[300px]">
                <Search className="w-4 h-4 text-muted-foreground mr-3" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent focus:ring-0"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-8 py-4 flex-shrink-0 bg-card/30 backdrop-blur-sm border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Categories</h3>
                <span className="text-sm text-muted-foreground">{filteredArticles.length} articles</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Articles Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 py-6" style={{ overflowY: 'auto' }}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {filteredArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/dashboard/education/${article.id}`}
                    className="block group animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className="bg-card border border-border shadow-soft hover:shadow-glow transition-all duration-300 hover:scale-105 overflow-hidden h-full">
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={`${getCategoryColor(article.category)} text-xs font-medium`}>
                            {article.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.readTime}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <User className="w-3 h-3 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center text-primary font-medium">
                            <span className="text-sm mr-1">Read Article</span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-lg"
                            >
                              #{tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-lg">
                              +{article.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {filteredArticles.length === 0 && (
                <div className="flex items-center justify-center py-20">
                  <Card className="bg-card border border-border shadow-soft max-w-md">
                    <CardContent className="text-center py-12 px-8">
                      <div className="text-6xl mb-4 opacity-20">📚</div>
                      <h3 className="font-semibold text-foreground text-lg mb-2">No articles found</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Try adjusting your search or selecting a different category
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('All');
                        }}
                        className="border-border hover:bg-muted"
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Education;
