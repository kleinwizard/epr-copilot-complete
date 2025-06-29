
import { KnowledgeBaseArticle, KnowledgeBaseCategory } from '../types/communication';

export class KnowledgeBaseService {
  private articles: Map<string, KnowledgeBaseArticle> = new Map();
  private categories: Map<string, KnowledgeBaseCategory> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock categories
    const mockCategories: KnowledgeBaseCategory[] = [
      {
        id: 'compliance',
        name: 'Compliance & Regulations',
        description: 'Oregon EPR compliance requirements and regulations',
        icon: 'FileText',
        articleCount: 15,
        order: 1
      },
      {
        id: 'materials',
        name: 'Materials & Packaging',
        description: 'Material classification and packaging requirements',
        icon: 'Package',
        articleCount: 23,
        order: 2
      },
      {
        id: 'fees',
        name: 'Fee Calculation',
        description: 'Understanding EPR fees and calculations',
        icon: 'DollarSign',
        articleCount: 8,
        order: 3
      },
      {
        id: 'reporting',
        name: 'Reporting & Submissions',
        description: 'How to prepare and submit quarterly reports',
        icon: 'BarChart3',
        articleCount: 12,
        order: 4
      }
    ];

    mockCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Mock articles
    const mockArticles: KnowledgeBaseArticle[] = [
      {
        id: 'article-1',
        title: 'Understanding Oregon EPR Requirements',
        content: `# Understanding Oregon EPR Requirements

Oregon's Extended Producer Responsibility (EPR) law requires producers to take responsibility for the full lifecycle of their packaging materials.

## Key Requirements

1. **Registration**: All producers must register with the state
2. **Material Reporting**: Quarterly reporting of packaging materials
3. **Fee Payment**: Payment of EPR fees based on material types and quantities
4. **Compliance Deadlines**: Strict adherence to quarterly reporting deadlines

## Getting Started

To begin compliance with Oregon EPR:

1. Register your company in the system
2. Set up your product catalog with accurate material data
3. Configure automated fee calculations
4. Schedule quarterly report submissions`,
        category: 'compliance',
        tags: ['epr', 'requirements', 'getting-started'],
        author: 'Oregon EPR Team',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-01T14:30:00Z',
        status: 'published',
        views: 1247,
        rating: 4.8,
        ratingCount: 45,
        isPublic: true,
        relatedArticles: ['article-2', 'article-3']
      },
      {
        id: 'article-2',
        title: 'Material Classification Guide',
        content: `# Material Classification Guide

Proper material classification is crucial for accurate EPR reporting and fee calculation.

## Common Material Types

### Plastics
- **Type 1 (PET)**: Bottles, containers
- **Type 2 (HDPE)**: Milk jugs, detergent bottles
- **Type 5 (PP)**: Yogurt containers, bottle caps

### Paper & Cardboard
- **Corrugated**: Shipping boxes
- **Paperboard**: Cereal boxes, product packaging
- **Mixed Paper**: Labels, inserts

### Metals
- **Aluminum**: Cans, foil
- **Steel**: Food cans, closures

## Classification Best Practices

1. Use the most specific material type available
2. Include all packaging components
3. Consider multi-material packaging separately
4. Document material weights accurately`,
        category: 'materials',
        tags: ['materials', 'classification', 'packaging'],
        author: 'Materials Team',
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-05-15T11:20:00Z',
        status: 'published',
        views: 892,
        rating: 4.6,
        ratingCount: 32,
        isPublic: true,
        relatedArticles: ['article-1', 'article-4']
      }
    ];

    mockArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
  }

  getCategories(): KnowledgeBaseCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  getCategoryById(categoryId: string): KnowledgeBaseCategory | undefined {
    return this.categories.get(categoryId);
  }

  getArticles(): KnowledgeBaseArticle[] {
    return Array.from(this.articles.values());
  }

  getArticleById(articleId: string): KnowledgeBaseArticle | undefined {
    return this.articles.get(articleId);
  }

  getArticlesByCategory(categoryId: string): KnowledgeBaseArticle[] {
    return this.getArticles().filter(article => article.category === categoryId);
  }

  searchArticles(query: string): KnowledgeBaseArticle[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getArticles().filter(article =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createArticle(articleData: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'rating' | 'ratingCount'>): Promise<KnowledgeBaseArticle> {
    const newArticle: KnowledgeBaseArticle = {
      ...articleData,
      id: `article-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      rating: 0,
      ratingCount: 0
    };

    this.articles.set(newArticle.id, newArticle);

    // Update category article count
    const category = this.categories.get(newArticle.category);
    if (category) {
      category.articleCount += 1;
    }

    return newArticle;
  }

  async updateArticle(articleId: string, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle | null> {
    const article = this.articles.get(articleId);
    if (!article) return null;

    const updated = {
      ...article,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.articles.set(articleId, updated);
    return updated;
  }

  async rateArticle(articleId: string, rating: number): Promise<boolean> {
    const article = this.articles.get(articleId);
    if (article && rating >= 1 && rating <= 5) {
      // Recalculate average rating
      const totalRating = article.rating * article.ratingCount + rating;
      article.ratingCount += 1;
      article.rating = totalRating / article.ratingCount;
      return true;
    }
    return false;
  }

  async incrementViews(articleId: string): Promise<void> {
    const article = this.articles.get(articleId);
    if (article) {
      article.views += 1;
    }
  }

  getPopularArticles(limit: number = 5): KnowledgeBaseArticle[] {
    return this.getArticles()
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  getRecentArticles(limit: number = 5): KnowledgeBaseArticle[] {
    return this.getArticles()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
