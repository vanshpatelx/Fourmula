import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, User, Share2, Bookmark, Heart } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  readTime: string;
  author: string;
  authorBio: string;
  image: string;
  tags: string[];
  publishDate: string;
}

const EducationDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from your API
    loadArticle(id);
  }, [id]);

  const loadArticle = (articleId: string | undefined) => {
    // Mock article data - in a real app, this would come from your API
    const articles: Record<string, Article> = {
      '1': {
        id: '1',
        title: 'Understanding Your Menstrual Cycle Phases',
        content: `
          <h2>Introduction</h2>
          <p>Understanding your menstrual cycle is crucial for optimizing your health, fitness, and overall well-being. Your cycle is much more than just your period – it's a complex dance of hormones that affects every aspect of your physiology.</p>
          
          <h2>The Four Phases</h2>
          
          <h3>1. Menstrual Phase (Days 1-5)</h3>
          <p>This is when your period occurs. Hormone levels are at their lowest, which can lead to lower energy levels, increased need for rest, higher pain sensitivity, and need for iron-rich foods.</p>
          
          <h3>2. Follicular Phase (Days 1-13)</h3>
          <p>Beginning with your period and ending with ovulation, this phase is characterized by rising estrogen levels, increasing energy, better mood and motivation, making it an ideal time for starting new projects.</p>
          
          <h3>3. Ovulatory Phase (Days 14-16)</h3>
          <p>The shortest phase, but with the highest energy levels. You'll experience peak estrogen and testosterone, maximum strength and endurance, enhanced communication skills, and this is the optimal time for challenging workouts.</p>
          
          <h3>4. Luteal Phase (Days 17-28)</h3>
          <p>The final phase before your next cycle begins, featuring rising progesterone, gradually decreasing energy, possible PMS symptoms, and increased need for carbohydrates.</p>
          
          <h2>Practical Applications</h2>
          <p>By tracking your cycle and understanding these phases, you can schedule important tasks during high-energy phases, adjust your workout intensity accordingly, plan your nutrition to support hormonal changes, and practice self-compassion during lower-energy times.</p>
          
          <h2>Conclusion</h2>
          <p>Your menstrual cycle is a powerful tool for understanding your body. By working with your natural rhythms instead of against them, you can optimize your performance, improve your health, and enhance your quality of life.</p>
        `,
        category: 'Cycle Health',
        readTime: '8 min read',
        author: 'Dr. Sarah Wilson',
        authorBio: 'Dr. Sarah Wilson is a board-certified gynecologist with over 15 years of experience in women\'s health. She specializes in hormonal health and cycle optimization.',
        image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
        tags: ['beginner', 'hormones', 'cycle tracking'],
        publishDate: 'March 15, 2024'
      },
      '2': {
        id: '2',
        title: 'Nutrition Through Your Cycle: What to Eat When',
        content: `
          <h2>Introduction</h2>
          <p>Your nutritional needs change throughout your menstrual cycle. By aligning your diet with your hormonal fluctuations, you can reduce symptoms, boost energy, and support overall health.</p>
          
          <h2>Menstrual Phase Nutrition</h2>
          <p>During menstruation, focus on iron-rich foods like lean red meat, spinach, and lentils to replenish iron lost through bleeding. Include vitamin C to enhance iron absorption, and warm, comforting foods to ease cramps.</p>
          
          <h2>Follicular Phase Foods</h2>
          <p>As estrogen rises, your metabolism is lower. This is a great time for lighter meals with plenty of fresh vegetables, lean proteins, and whole grains. Include foods rich in omega-3 fatty acids and phytoestrogens like flaxseeds.</p>
          
          <h2>Ovulatory Phase Eating</h2>
          <p>During ovulation, support your body with antioxidant-rich foods like berries, leafy greens, and colorful vegetables. Include calcium-rich foods and fiber to help metabolize excess estrogen.</p>
          
          <h2>Luteal Phase Nutrition</h2>
          <p>As progesterone rises, so does your metabolism. Increase complex carbohydrates like sweet potatoes, quinoa, and oats. Include magnesium-rich foods like dark chocolate, nuts, and seeds to combat PMS symptoms.</p>
          
          <h2>Key Takeaways</h2>
          <p>Cycle syncing your nutrition doesn't have to be complicated. Focus on whole, nutrient-dense foods, stay hydrated, and listen to your body's cravings - they often signal what you need.</p>
        `,
        category: 'Nutrition',
        readTime: '12 min read',
        author: 'Lisa Chen, RD',
        authorBio: 'Lisa Chen is a registered dietitian specializing in women\'s nutrition and hormonal health. She has helped thousands of women optimize their diets for better cycle health.',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop',
        tags: ['nutrition', 'meal planning', 'cycle syncing'],
        publishDate: 'March 18, 2024'
      },
      '3': {
        id: '3',
        title: 'Cycle Syncing Your Workouts for Better Results',
        content: `
          <h2>Introduction</h2>
          <p>Your hormones fluctuate throughout your cycle, and so should your workouts. By matching your training intensity to your hormonal phases, you can maximize results while minimizing injury risk.</p>
          
          <h2>Menstrual Phase Workouts</h2>
          <p>During your period, opt for gentle movement like yoga, walking, or light stretching. Honor your body's need for rest. If you feel good, light resistance training is fine, but avoid pushing too hard.</p>
          
          <h2>Follicular Phase Training</h2>
          <p>As energy increases, gradually ramp up intensity. This is a great time to try new exercises, increase weights, or push your cardiovascular endurance. Your body is primed for progress.</p>
          
          <h2>Ovulatory Phase Performance</h2>
          <p>This is your power phase! Peak testosterone and estrogen make this the ideal time for high-intensity training, heavy lifting, and challenging yourself with new personal records. Your strength and endurance are at their maximum.</p>
          
          <h2>Luteal Phase Movement</h2>
          <p>As progesterone rises and energy decreases, shift to moderate intensity. Focus on strength training with moderate weights, steady-state cardio, and Pilates. The week before your period, dial it back further with yoga and walks.</p>
          
          <h2>Listen to Your Body</h2>
          <p>These are guidelines, not rules. Some women feel strong throughout their cycle, while others need more rest. Track your workouts and how you feel to find your perfect rhythm.</p>
        `,
        category: 'Training & Fitness',
        readTime: '10 min read',
        author: 'Emma Rodriguez, CPT',
        authorBio: 'Emma Rodriguez is a certified personal trainer with a focus on women\'s fitness and cycle-synced training programs. She has trained elite athletes and everyday women for over 10 years.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        tags: ['fitness', 'strength training', 'performance'],
        publishDate: 'March 20, 2024'
      },
      '4': {
        id: '4',
        title: 'The Science Behind Hormonal Fluctuations',
        content: `
          <h2>Understanding Your Hormones</h2>
          <p>Your menstrual cycle is orchestrated by four main hormones: estrogen, progesterone, FSH (follicle-stimulating hormone), and LH (luteinizing hormone). Understanding how these hormones interact can help you better understand your body.</p>
          
          <h2>Estrogen's Role</h2>
          <p>Estrogen is your energy hormone. It rises during the follicular phase, peaks at ovulation, and drops before menstruation. High estrogen improves mood, energy, skin quality, and even cognitive function. It also supports bone health and cardiovascular function.</p>
          
          <h2>Progesterone's Function</h2>
          <p>Progesterone rises after ovulation and prepares the body for potential pregnancy. It has a calming effect but can also cause fatigue, increased appetite, and water retention. When progesterone drops rapidly before menstruation, it can trigger PMS symptoms.</p>
          
          <h2>Testosterone in Women</h2>
          <p>Though often thought of as a male hormone, testosterone plays crucial roles in women's health. It peaks around ovulation, contributing to increased libido, energy, and muscle-building capacity. Low testosterone can lead to fatigue and decreased motivation.</p>
          
          <h2>The Domino Effect</h2>
          <p>These hormones don't work in isolation. They interact with insulin, cortisol, thyroid hormones, and more. This is why stress, sleep, and nutrition can so profoundly affect your cycle.</p>
          
          <h2>Conclusion</h2>
          <p>Understanding the science behind your hormones empowers you to make informed decisions about your health, from choosing the right birth control to optimizing your lifestyle for hormonal balance.</p>
        `,
        category: 'Hormones',
        readTime: '15 min read',
        author: 'Dr. Michael Torres',
        authorBio: 'Dr. Michael Torres is an endocrinologist specializing in reproductive hormones and women\'s health. His research focuses on hormonal optimization for overall wellness.',
        image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&h=400&fit=crop',
        tags: ['science', 'hormones', 'research'],
        publishDate: 'March 22, 2024'
      },
      '5': {
        id: '5',
        title: 'Managing PMS Naturally: A Holistic Approach',
        content: `
          <h2>Understanding PMS</h2>
          <p>Premenstrual syndrome (PMS) affects up to 90% of menstruating women. While symptoms vary, common complaints include mood swings, bloating, breast tenderness, fatigue, and irritability.</p>
          
          <h2>Nutritional Strategies</h2>
          <p>Increase magnesium through dark leafy greens, nuts, and seeds. Reduce caffeine and alcohol, which can worsen symptoms. Include vitamin B6-rich foods like chickpeas, bananas, and salmon. Stay hydrated and reduce salt intake to minimize bloating.</p>
          
          <h2>Movement as Medicine</h2>
          <p>Regular exercise is one of the most effective PMS remedies. Even gentle yoga or walking can boost endorphins, reduce stress, and alleviate symptoms. Aim for at least 30 minutes most days of the week.</p>
          
          <h2>Stress Management</h2>
          <p>Chronic stress worsens PMS by affecting hormonal balance. Practice stress-reduction techniques like meditation, deep breathing, journaling, or spending time in nature. Prioritize sleep - aim for 7-9 hours nightly.</p>
          
          <h2>Herbal Remedies</h2>
          <p>Consider evidence-based supplements like chasteberry (Vitex), evening primrose oil, and calcium. Always consult with a healthcare provider before starting new supplements.</p>
          
          <h2>When to Seek Help</h2>
          <p>If PMS symptoms significantly impact your quality of life, don't suffer in silence. Severe PMS (PMDD) requires medical intervention. Your healthcare provider can offer additional treatment options.</p>
        `,
        category: 'Wellness',
        readTime: '6 min read',
        author: 'Dr. Amanda Green',
        authorBio: 'Dr. Amanda Green is a naturopathic doctor specializing in women\'s hormonal health and natural medicine approaches to cycle-related concerns.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
        tags: ['PMS', 'natural remedies', 'wellness'],
        publishDate: 'March 25, 2024'
      },
      '6': {
        id: '6',
        title: 'Essential Supplements for Women\'s Health',
        content: `
          <h2>Foundation Supplements</h2>
          <p>Every woman should consider a high-quality multivitamin, vitamin D3 (especially in winter months), and omega-3 fatty acids. These form the foundation of a good supplement regimen.</p>
          
          <h2>Magnesium for Cycle Health</h2>
          <p>Magnesium glycinate (300-400mg daily) can reduce PMS symptoms, improve sleep, and support hundreds of bodily functions. It's particularly helpful for cramps and mood.</p>
          
          <h2>B Vitamins for Energy</h2>
          <p>B-complex vitamins support energy production, hormone metabolism, and nervous system function. B6 specifically helps with PMS and mood regulation.</p>
          
          <h2>Iron for Menstruating Women</h2>
          <p>Women with heavy periods may need iron supplementation. Get your levels tested before supplementing, as too much iron can be harmful. Pair iron with vitamin C for better absorption.</p>
          
          <h2>Probiotics for Gut Health</h2>
          <p>Your gut health directly impacts hormone balance. A good probiotic can support estrogen metabolism, reduce inflammation, and improve overall health.</p>
          
          <h2>Important Notes</h2>
          <p>Supplements complement, not replace, a healthy diet. Quality matters - choose third-party tested brands. Always consult your healthcare provider, especially if taking medications or have health conditions.</p>
        `,
        category: 'Supplements',
        readTime: '9 min read',
        author: 'Jennifer Walsh, PharmD',
        authorBio: 'Jennifer Walsh is a clinical pharmacist specializing in nutritional supplements and women\'s health. She helps patients optimize their supplement regimens for better health outcomes.',
        image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=400&fit=crop',
        tags: ['supplements', 'vitamins', 'health'],
        publishDate: 'March 28, 2024'
      },
      '7': {
        id: '7',
        title: 'Sleep and Your Cycle: Why Rest Matters',
        content: `
          <h2>The Sleep-Hormone Connection</h2>
          <p>Your menstrual cycle affects sleep quality, and sleep affects your hormones. Understanding this two-way relationship can help you optimize both.</p>
          
          <h2>Sleep Changes Throughout Your Cycle</h2>
          <p>During the follicular phase, higher estrogen improves sleep quality. Around ovulation, you might feel most rested. In the luteal phase, rising progesterone can make you drowsy during the day but disrupt sleep at night. Right before menstruation, many women experience insomnia.</p>
          
          <h2>Optimizing Sleep During Menstruation</h2>
          <p>Use heating pads for cramps, take magnesium before bed, and maintain a cool room temperature. Consider gentle stretching or yoga before bed to ease discomfort.</p>
          
          <h2>Sleep Hygiene Basics</h2>
          <p>Maintain consistent sleep and wake times, even on weekends. Create a dark, cool sleeping environment. Limit screen time 1-2 hours before bed. Avoid caffeine after 2 PM.</p>
          
          <h2>When Sleep Issues Persist</h2>
          <p>If sleep problems occur throughout your cycle, consider factors like stress, sleep apnea, or thyroid issues. Track your sleep patterns and discuss concerns with your healthcare provider.</p>
          
          <h2>The Bottom Line</h2>
          <p>Prioritize sleep as much as you do nutrition and exercise. Quality sleep supports hormone balance, weight management, mood stability, and overall health.</p>
        `,
        category: 'Wellness',
        readTime: '7 min read',
        author: 'Dr. Rachel Kim',
        authorBio: 'Dr. Rachel Kim is a sleep medicine specialist who focuses on the intersection of women\'s hormonal health and sleep quality.',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=400&fit=crop',
        tags: ['sleep', 'recovery', 'wellness'],
        publishDate: 'April 1, 2024'
      },
      '8': {
        id: '8',
        title: 'Iron Deficiency and Menstruation: What You Need to Know',
        content: `
          <h2>Why Iron Matters</h2>
          <p>Iron is essential for oxygen transport, energy production, and immune function. Women of reproductive age are at higher risk of iron deficiency due to monthly blood loss.</p>
          
          <h2>Signs of Iron Deficiency</h2>
          <p>Fatigue, weakness, pale skin, shortness of breath, cold hands and feet, brittle nails, and frequent infections can all signal low iron. Severe deficiency leads to anemia.</p>
          
          <h2>Heavy Periods and Iron Loss</h2>
          <p>If you soak through a pad or tampon every 1-2 hours, pass large clots, or have periods lasting more than 7 days, you may be losing too much iron. This requires medical attention.</p>
          
          <h2>Dietary Iron Sources</h2>
          <p>Heme iron (from animal sources) is best absorbed: red meat, liver, and seafood. Non-heme iron (from plants) includes spinach, lentils, and fortified cereals. Pair plant iron with vitamin C for better absorption.</p>
          
          <h2>Iron Supplementation</h2>
          <p>If dietary changes aren't enough, supplementation may be necessary. Iron bisglycinate is gentler on the stomach than ferrous sulfate. Take on an empty stomach with vitamin C, away from calcium and tea.</p>
          
          <h2>When to See a Doctor</h2>
          <p>Get your iron levels tested if you experience symptoms. Heavy periods may indicate underlying issues like fibroids or hormonal imbalances that need treatment.</p>
        `,
        category: 'Nutrition',
        readTime: '11 min read',
        author: 'Dr. Patricia Moore',
        authorBio: 'Dr. Patricia Moore is a hematologist specializing in iron deficiency and anemia in women. She advocates for better screening and treatment of menstrual-related iron loss.',
        image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=400&fit=crop',
        tags: ['iron', 'nutrition', 'health'],
        publishDate: 'April 5, 2024'
      }
    };

    const foundArticle = articles[articleId || ''];
    if (foundArticle) {
      setArticle(foundArticle);
    }
  };

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

  if (!article) {
    return (
      <ProtectedRoute>
        <DashboardLayout title="Education" showSearch={true}>
          <div className="flex-1 bg-white overflow-auto">
            <div className="p-8">
              <div className="text-center py-20">
                <p className="text-muted-foreground">Article not found</p>
                <Link to="/dashboard/education">
                  <Button className="mt-4">Back to Education</Button>
                </Link>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Education" showSearch={true}>
        <div className="flex-1 bg-white overflow-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Mobile Header */}
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Back Button Overlay */}
              <Link
                to="/dashboard/education"
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
            </div>

            {/* Article Content */}
            <div className="p-6 pb-32">
              {/* Article Meta */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${getCategoryColor(article.category)} text-xs`}>
                    {article.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {article.title}
                </h1>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">{article.author}</div>
                      <div className="text-xs">{article.publishDate}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isBookmarked ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Article Body */}
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  fontSize: '16px',
                  lineHeight: '1.7'
                }}
              />

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-2xl"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author Bio */}
              <div className="mt-8 p-4 bg-gray-50 rounded-3xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">About {article.author}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {article.authorBio}
                </p>
              </div>

              {/* Back to Education */}
              <div className="mt-8">
                <Link to="/dashboard/education">
                  <Button className="w-full h-12 rounded-2xl">
                    Back to Education
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-background to-muted/20 min-h-screen">
              {/* Hero Section */}
              <div className="relative h-96 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
                
                {/* Back Button */}
                <div className="absolute top-8 left-8">
                  <Link to="/dashboard/education">
                    <Button variant="outline" className="bg-card/90 backdrop-blur-sm border-2">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Education
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Article Content */}
              <div className="max-w-4xl mx-auto px-8 -mt-32 relative z-10 pb-16">
                <Card className="bg-card border border-border shadow-xl">
                  <CardContent className="p-10">
                    {/* Article Header */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${getCategoryColor(article.category)} text-sm px-4 py-1`}>
                          {article.category}
                        </Badge>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isLiked ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground hover:bg-red-50'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isBookmarked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:bg-primary/5'
                            }`}
                          >
                            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center transition-all">
                            <Share2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                        {article.title}
                      </h1>
                      
                      <div className="flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span className="font-medium">{article.author}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <span className="text-sm">{article.publishDate}</span>
                      </div>
                    </div>

                    {/* Article Body */}
                    <div 
                      className="prose prose-lg max-w-none text-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                      style={{
                        fontSize: '18px',
                        lineHeight: '1.8'
                      }}
                    />

                    {/* Tags */}
                    <div className="mt-10 pt-8 border-t border-border">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 bg-muted text-muted-foreground text-sm rounded-xl hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Author Bio */}
                    <div className="mt-10 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg mb-2">About {article.author}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {article.authorBio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-10">
                      <Link to="/dashboard/education">
                        <Button className="w-full h-12 text-base">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to All Articles
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default EducationDetail;