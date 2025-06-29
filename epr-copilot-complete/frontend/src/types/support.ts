
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  views: number;
  helpful: number;
  notHelpful: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number;
  lessons: TrainingLesson[];
}

export interface TrainingLesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'article' | 'interactive' | 'quiz';
  duration: number;
  completed: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface ContextualTip {
  id: string;
  page: string;
  element: string;
  title: string;
  content: string;
  type: 'tooltip' | 'popover' | 'modal';
  trigger: 'hover' | 'click' | 'focus';
}
