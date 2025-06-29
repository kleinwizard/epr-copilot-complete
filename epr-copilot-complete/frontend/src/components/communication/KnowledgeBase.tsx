
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, Eye, ThumbsUp, FileText, Package, DollarSign, BarChart3 } from 'lucide-react';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { KnowledgeBaseArticle, KnowledgeBaseCategory } from '@/types/communication';

export const KnowledgeBase = () => {
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([]);
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [popularArticles, setPopularArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const categoryData = knowledgeBaseService.getCategories();
    const articleData = knowledgeBaseService.getArticles();
    const popular = knowledgeBaseService.getPopularArticles();

    setCategories(categoryData);
    setArticles(articleData);
    setPopularArticles(popular);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = knowledgeBaseService.searchArticles(searchQuery);
      setArticles(results);
      setSelectedCategory(null);
    } else {
      loadData();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    const categoryArticles = knowledgeBaseService.getArticlesByCategory(categoryId);
    setArticles(categoryArticles);
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'compliance':
        return <FileText className="h-5 w-5" />;
      case 'materials':
        return <Package className="h-5 w-5" />;
      case 'fees':
        return <DollarSign className="h-5 w-5" />;
      case 'reporting':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex space-x-2 max-w-md">
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory(null);
                      loadData();
                    }}
                  >
                    All Articles
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {getCategoryIcon(category.id)}
                      <span className="ml-2">{category.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {category.articleCount}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Articles */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg hover:text-blue-600">
                            {article.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            By {article.author} • {formatDate(article.updatedAt)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {categories.find(c => c.id === article.category)?.name}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3 mb-4">
                        {article.content.replace(/[#*]/g, '').substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            {renderStars(article.rating)}
                            <span className="text-sm text-gray-600">
                              ({article.ratingCount})
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Eye className="h-4 w-4" />
                            <span>{article.views} views</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg hover:text-blue-600">
                    {article.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    By {article.author}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(article.rating)}
                        <span className="text-sm text-gray-600">
                          ({article.ratingCount})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Eye className="h-4 w-4" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                    <Badge variant="outline">Popular</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {knowledgeBaseService.getRecentArticles().map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg hover:text-blue-600">
                    {article.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Updated {formatDate(article.updatedAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(article.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        ({article.ratingCount})
                      </span>
                    </div>
                    <Badge variant="outline">Recent</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
