import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: 'all', name: 'All', emoji: '🛍️' },
    { id: 'supplements', name: 'Supplements', emoji: '💊' },
    { id: 'wellness', name: 'Wellness', emoji: '🌿' },
    { id: 'fitness', name: 'Fitness', emoji: '🏋️‍♀️' },
    { id: 'skincare', name: 'Skincare', emoji: '✨' },
    { id: 'nutrition', name: 'Nutrition', emoji: '🥗' },
  ];

  // Products will be synced from Shopify API
  const products: any[] = [];

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products;

  return (
    <ProtectedRoute>
      <DashboardLayout title="Shop" showSearch={true}>
        <div className="flex-1 bg-gray-50 overflow-auto">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Mobile Header */}
            <div className="bg-white px-6 pt-12 pb-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Shop</h1>
                  <p className="text-gray-500 text-sm">Curated wellness products</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rounded-xl border border-gray-200 focus:border-gray-900 bg-white text-base h-12 focus:ring-0"
                />
              </div>

              {/* Categories */}
              <div className="flex space-x-3 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-3 px-5 py-4 rounded-2xl transition-all duration-200 whitespace-nowrap min-w-[140px] ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{category.emoji}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className={`text-xs ${selectedCategory === category.id ? 'text-gray-300' : 'text-gray-400'}`}>
                        {filteredProducts.filter(p => category.id === 'all' || p.category === category.id).length} Products
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Products Section */}
            <div className="px-6 pb-32">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Popular Products</h2>
                <button className="text-sm text-gray-500">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${
                      isLoaded 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      transitionDelay: `${index * 150}ms`,
                      transform: isLoaded ? 'translateY(0)' : 'translateY(32px)',
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative bg-gray-100 h-36 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        loading="lazy"
                      />
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                      >
                        <Heart 
                          className={`w-4 h-4 transition-colors ${
                            favorites.includes(product.id) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-medium text-gray-900 mb-1 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">{product.brand}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => window.open(product.shopifyUrl, '_blank')}
                          className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        >
                          <ExternalLink className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6 opacity-30">🛍️</div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-xl">Products Coming Soon</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    We're connecting with Shopify to bring you curated wellness products. 
                    Check back soon to discover products tailored to your cycle and wellness goals.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Shop</h1>
                    <p className="text-muted-foreground">Curated wellness products for your journey</p>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-card"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-1">{category.emoji}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-500 hover:scale-[1.02] group ${
                        isLoaded 
                          ? 'opacity-100 translate-y-0' 
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{
                        transitionDelay: `${index * 100}ms`,
                        transform: isLoaded ? 'translateY(0)' : 'translateY(32px)',
                      }}
                    >
                      <div className="relative bg-muted h-48 overflow-hidden">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        {product.badge && (
                          <Badge className={`absolute top-3 left-3 ${
                            product.badge === 'Best Seller' ? 'bg-amber-500 text-white border-0' :
                            product.badge === 'New' ? 'bg-emerald-500 text-white border-0' :
                            product.badge === 'Trending' ? 'bg-purple-500 text-white border-0' :
                            'bg-red-500 text-white border-0'
                          }`}>
                            {product.badge}
                          </Badge>
                        )}
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/95 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${
                              favorites.includes(product.id) 
                                ? 'text-red-500 fill-red-500' 
                                : 'text-muted-foreground hover:text-red-400'
                            }`} 
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground font-medium mb-1">{product.brand}</p>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center space-x-1 mb-3">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-lg text-foreground">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => window.open(product.shopifyUrl, '_blank')}
                            className="transition-all duration-300 hover:scale-105"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-7xl mb-6 opacity-30">🛍️</div>
                    <h3 className="font-semibold text-foreground mb-3 text-2xl">Products Coming Soon</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      We're connecting with Shopify to bring you curated wellness products. 
                      Check back soon to discover products tailored to your cycle and wellness goals.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Shop;