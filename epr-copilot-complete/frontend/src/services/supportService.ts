
import { HelpArticle, TrainingModule, SupportTicket, ContextualTip } from '@/types/support';

class SupportService {
  // Help Articles
  async getHelpArticles(): Promise<HelpArticle[]> {
    return [
      {
        id: '1',
        title: 'Getting Started with EPR Compliance',
        content: 'Learn the basics of Extended Producer Responsibility and how to set up your first compliance report.',
        category: 'Getting Started',
        tags: ['basics', 'setup', 'compliance'],
        lastUpdated: '2024-06-20',
        views: 1250,
        helpful: 45,
        notHelpful: 3
      },
      {
        id: '2',
        title: 'Product Catalog Management',
        content: 'Comprehensive guide on how to add, edit, and manage products in your catalog.',
        category: 'Product Management',
        tags: ['products', 'catalog', 'management'],
        lastUpdated: '2024-06-19',
        views: 890,
        helpful: 38,
        notHelpful: 2
      },
      {
        id: '3',
        title: 'Understanding Fee Calculations',
        content: 'Detailed explanation of how EPR fees are calculated and what factors affect them.',
        category: 'Fees & Payments',
        tags: ['fees', 'calculations', 'payments'],
        lastUpdated: '2024-06-18',
        views: 2100,
        helpful: 78,
        notHelpful: 5
      }
    ];
  }

  async searchHelpArticles(query: string): Promise<HelpArticle[]> {
    const articles = await this.getHelpArticles();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Training Modules
  async getTrainingModules(): Promise<TrainingModule[]> {
    return [
      {
        id: '1',
        title: 'EPR Compliance Fundamentals',
        description: 'Learn the core concepts of Extended Producer Responsibility',
        duration: 45,
        level: 'beginner',
        completed: false,
        progress: 0,
        lessons: [
          {
            id: '1-1',
            title: 'What is EPR?',
            content: 'Introduction to Extended Producer Responsibility',
            type: 'video',
            duration: 10,
            completed: false
          },
          {
            id: '1-2',
            title: 'Regulatory Framework',
            content: 'Understanding the legal requirements',
            type: 'article',
            duration: 15,
            completed: false
          }
        ]
      },
      {
        id: '2',
        title: 'Advanced Reporting Techniques',
        description: 'Master complex reporting scenarios and calculations',
        duration: 90,
        level: 'advanced',
        completed: false,
        progress: 25,
        lessons: [
          {
            id: '2-1',
            title: 'Complex Fee Calculations',
            content: 'Advanced fee calculation methods',
            type: 'interactive',
            duration: 30,
            completed: true
          },
          {
            id: '2-2',
            title: 'Multi-jurisdiction Reporting',
            content: 'Handling reports across multiple jurisdictions',
            type: 'video',
            duration: 25,
            completed: false
          }
        ]
      }
    ];
  }

  // Support Tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    return [
      {
        id: 'TICK-001',
        subject: 'Unable to submit quarterly report',
        description: 'Getting an error when trying to submit my Q1 2024 report',
        status: 'in-progress',
        priority: 'high',
        category: 'Technical Issue',
        createdAt: '2024-06-20T10:30:00Z',
        updatedAt: '2024-06-20T14:15:00Z',
        assignedTo: 'Sarah Johnson'
      },
      {
        id: 'TICK-002',
        subject: 'Question about fee calculation',
        description: 'Need clarification on how eco-modulation fees are calculated',
        status: 'open',
        priority: 'medium',
        category: 'General Question',
        createdAt: '2024-06-19T09:15:00Z',
        updatedAt: '2024-06-19T09:15:00Z'
      }
    ];
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TICK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return newTicket;
  }

  // Contextual Help
  async getContextualTips(page: string): Promise<ContextualTip[]> {
    const allTips: ContextualTip[] = [
      {
        id: '1',
        page: 'dashboard',
        element: 'compliance-score',
        title: 'Compliance Score',
        content: 'Your compliance score is calculated based on completed tasks and upcoming deadlines.',
        type: 'tooltip',
        trigger: 'hover'
      },
      {
        id: '2',
        page: 'product-catalog',
        element: 'add-product-button',
        title: 'Adding Products',
        content: 'Click here to add new products to your catalog. Make sure to include all required material information.',
        type: 'popover',
        trigger: 'click'
      },
      {
        id: '3',
        page: 'fees',
        element: 'fee-calculator',
        title: 'Fee Calculator',
        content: 'Use this calculator to estimate your EPR fees before submitting your report.',
        type: 'tooltip',
        trigger: 'hover'
      }
    ];
    
    return allTips.filter(tip => tip.page === page);
  }
}

export const supportService = new SupportService();
