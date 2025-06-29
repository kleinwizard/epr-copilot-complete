
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supportService } from '@/services/supportService';
import { HelpArticle } from '@/types/support';
import { Search, ThumbsUp, ThumbsDown, Eye, Calendar } from 'lucide-react';

export const HelpCenter = () => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const articlesData = await supportService.getHelpArticles();
    setArticles(articlesData);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const searchResults = await supportService.searchHelpArticles(searchQuery);
      setArticles(searchResults);
    } else {
      loadArticles();
    }
  };

  const categories = ['all', 'Getting Started', 'Product Management', 'Fees & Payments', 'Reporting', 'Technical'];

  const filteredArticles = articles.filter(article => 
    selectedCategory === 'all' || article.category === selectedCategory
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedArticle(null)}>
            ← Back to Articles
          </Button>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {selectedArticle.views} views
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Updated {formatDate(selectedArticle.lastUpdated)}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedArticle.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{selectedArticle.category}</Badge>
              {selectedArticle.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p>{selectedArticle.content}</p>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-4">Was this article helpful?</p>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Yes ({selectedArticle.helpful})
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No ({selectedArticle.notHelpful})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Help Articles</CardTitle>
          <CardDescription>Find answers to your questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => (
          <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedArticle(article)}>
            <CardHeader>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <Badge variant="secondary" className="w-fit">{article.category}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {article.views}
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {article.helpful}
                  </div>
                </div>
                <span>Updated {formatDate(article.lastUpdated)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {article.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No articles found. Try adjusting your search or category filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
