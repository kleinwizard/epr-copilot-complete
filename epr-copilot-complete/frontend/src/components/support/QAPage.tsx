import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronRight, HelpCircle, Settings, AlertCircle } from 'lucide-react';

interface QAItem {
  id: string;
  question: string;
  answer: string;
  category: 'Application Support' | 'EPR Compliance';
  tags: string[];
}

export function QAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const qaItems: QAItem[] = [
    {
      id: '1',
      question: 'How do I fix a CSV import error?',
      answer: 'Most errors are caused by incorrect column headers or formatting. Please review our CSV formatting guide in the "Guides" section and ensure your file matches it exactly. Common issues include missing `product_id` or using text in a numbers-only field like `component_weight_grams`.',
      category: 'Application Support',
      tags: ['CSV', 'Import', 'Error', 'Formatting']
    },
    {
      id: '2',
      question: 'Can I invite a user with read-only access?',
      answer: 'Yes. When you invite a team member from Settings -> Team Management, you will be able to assign them a role. Choose the "Viewer" role to grant them read-only access to your company\'s data.',
      category: 'Application Support',
      tags: ['Team', 'Permissions', 'Access', 'Viewer']
    },
    {
      id: '3',
      question: 'Where do I find my API Key?',
      answer: 'Navigate to Settings -> API & Integrations. If you haven\'t created a key yet, you can generate a new one there. For security, we only show the key once upon creation. Be sure to copy it and store it in a safe place.',
      category: 'Application Support',
      tags: ['API', 'Key', 'Settings', 'Integration']
    },
    {
      id: '4',
      question: 'What is a Producer Responsibility Organization (PRO)?',
      answer: 'A PRO is an organization that producers contract with to manage their EPR compliance obligations in a specific jurisdiction. They handle fee collection, reporting to the state, and managing recycling programs on behalf of their member companies. This platform helps you gather the data your PRO requires.',
      category: 'EPR Compliance',
      tags: ['PRO', 'Organization', 'Compliance', 'Jurisdiction']
    },
    {
      id: '5',
      question: 'Is a shipping box I use for e-commerce considered packaging?',
      answer: 'Yes, in most jurisdictions, tertiary packaging like shipping boxes is covered under EPR legislation and must be reported.',
      category: 'EPR Compliance',
      tags: ['Packaging', 'Shipping', 'E-commerce', 'Tertiary']
    },
    {
      id: '6',
      question: 'What\'s the difference between SB 54 (California) and LD 1541 (Maine)?',
      answer: 'While both are EPR laws, they have different structures. California\'s law is managed by a single PRO which sets and collects fees. Maine\'s law is a municipal reimbursement model, where the state determines costs and producers reimburse municipalities for their recycling programs. Our platform is designed to handle the reporting requirements for both models.',
      category: 'EPR Compliance',
      tags: ['California', 'Maine', 'SB 54', 'LD 1541', 'Laws']
    }
  ];

  const categories = ['all', 'Application Support', 'EPR Compliance'];

  const filteredItems = qaItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Application Support':
        return <Settings className="h-4 w-4" />;
      case 'EPR Compliance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Questions & Answers</h2>
        <p className="text-muted-foreground">
          Find quick answers to common questions about EPR compliance and using our platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Q&A</CardTitle>
          <CardDescription>Search through our frequently asked questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search questions and answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-2 overflow-x-auto">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap flex items-center space-x-2"
          >
            {getCategoryIcon(category)}
            <span>{category === 'all' ? 'All Categories' : category}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Application Support', 'EPR Compliance'].map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </CardTitle>
                <CardDescription>
                  {category === 'Application Support' 
                    ? 'Questions about using the platform'
                    : 'Questions about EPR compliance and regulations'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="border rounded-lg">
                      <button
                        className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
                        onClick={() => toggleItem(item.id)}
                      >
                        <span className="font-medium text-sm">{item.question}</span>
                        {openItems.has(item.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {openItems.has(item.id) && (
                        <div className="px-3 pb-3 bg-white rounded-b-lg">
                          <div className="pt-2 text-sm text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No questions found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
