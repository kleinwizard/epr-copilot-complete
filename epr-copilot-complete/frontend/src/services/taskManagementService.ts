
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'compliance' | 'deadline' | 'review' | 'submission' | 'payment' | 'approval' | 'general';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  relatedEntities: TaskEntity[];
  subtasks: Subtask[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  dependencies: string[];
  recurrence?: TaskRecurrence;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  editedAt?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TaskEntity {
  type: 'document' | 'product' | 'material' | 'report' | 'requirement';
  id: string;
  name: string;
}

export interface TaskRecurrence {
  pattern: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  endDate?: string;
  nextOccurrence?: string;
}

export interface TaskFilter {
  assignedTo?: string;
  createdBy?: string;
  status?: Task['status'];
  type?: Task['type'];
  priority?: Task['priority'];
  dueDate?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  searchTerm?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  byStatus: Record<Task['status'], number>;
  byPriority: Record<Task['priority'], number>;
  byType: Record<Task['type'], number>;
  completionRate: number;
}

export class TaskManagementService {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Submit Q4 2024 EPR Report',
        description: 'Complete and submit the quarterly EPR compliance report with all required material data',
        type: 'submission',
        status: 'in_progress',
        priority: 'high',
        assignedTo: ['john.doe@company.com', 'compliance.manager@company.com'],
        createdBy: 'admin@company.com',
        createdAt: '2024-06-20T09:00:00Z',
        updatedAt: '2024-06-23T14:30:00Z',
        dueDate: '2024-06-30T23:59:59Z',
        estimatedHours: 8,
        actualHours: 4,
        tags: ['epr', 'quarterly', 'compliance', 'priority'],
        relatedEntities: [
          {
            type: 'report',
            id: 'report-q4-2024',
            name: 'Q4 2024 EPR Report'
          },
          {
            type: 'requirement',
            id: 'req-1',
            name: 'California EPR Packaging Waste Regulation'
          }
        ],
        subtasks: [
          {
            id: 'subtask-1',
            title: 'Collect material data',
            completed: true,
            completedBy: 'john.doe@company.com',
            completedAt: '2024-06-21T10:00:00Z'
          },
          {
            id: 'subtask-2',
            title: 'Calculate fees',
            completed: true,
            completedBy: 'john.doe@company.com',
            completedAt: '2024-06-22T15:30:00Z'
          },
          {
            id: 'subtask-3',
            title: 'Review and validate data',
            completed: false
          },
          {
            id: 'subtask-4',
            title: 'Submit to authority',
            completed: false
          }
        ],
        comments: [
          {
            id: 'comment-1',
            text: 'Data collection is complete. Moving to validation phase.',
            author: 'John Doe',
            authorEmail: 'john.doe@company.com',
            createdAt: '2024-06-22T16:00:00Z'
          }
        ],
        attachments: [],
        dependencies: []
      },
      {
        id: 'task-2',
        title: 'Annual Fee Payment',
        description: 'Process payment for annual EPR compliance fees',
        type: 'payment',
        status: 'not_started',
        priority: 'medium',
        assignedTo: ['finance@company.com'],
        createdBy: 'system@company.com',
        createdAt: '2024-06-24T08:00:00Z',
        updatedAt: '2024-06-24T08:00:00Z',
        dueDate: '2024-07-15T23:59:59Z',
        estimatedHours: 2,
        tags: ['payment', 'annual', 'fees'],
        relatedEntities: [
          {
            type: 'document',
            id: 'invoice-2024-001',
            name: 'Annual EPR Fee Invoice'
          }
        ],
        subtasks: [
          {
            id: 'subtask-5',
            title: 'Review invoice details',
            completed: false
          },
          {
            id: 'subtask-6',
            title: 'Approve payment',
            completed: false
          },
          {
            id: 'subtask-7',
            title: 'Process payment',
            completed: false
          }
        ],
        comments: [],
        attachments: [],
        dependencies: ['task-1']
      }
    ];

    mockTasks.forEach(task => this.tasks.set(task.id, task));
  }

  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.set(id, newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Auto-complete task if all subtasks are done
    if (updates.subtasks) {
      const allSubtasksComplete = updates.subtasks.every(st => st.completed);
      if (allSubtasksComplete && task.status !== 'completed') {
        updatedTask.status = 'completed';
        updatedTask.completedAt = new Date().toISOString();
      }
    }

    this.tasks.set(id, updatedTask);
    return true;
  }

  getTask(id: string): Task | null {
    return this.tasks.get(id) || null;
  }

  getTasks(filter: TaskFilter = {}): Task[] {
    let results = Array.from(this.tasks.values());

    if (filter.assignedTo) {
      results = results.filter(task => task.assignedTo.includes(filter.assignedTo!));
    }

    if (filter.createdBy) {
      results = results.filter(task => task.createdBy === filter.createdBy);
    }

    if (filter.status) {
      results = results.filter(task => task.status === filter.status);
    }

    if (filter.type) {
      results = results.filter(task => task.type === filter.type);
    }

    if (filter.priority) {
      results = results.filter(task => task.priority === filter.priority);
    }

    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(task => 
        filter.tags!.some(tag => task.tags.includes(tag))
      );
    }

    if (filter.dueDate) {
      if (filter.dueDate.start || filter.dueDate.end) {
        const start = filter.dueDate.start ? new Date(filter.dueDate.start) : new Date(0);
        const end = filter.dueDate.end ? new Date(filter.dueDate.end) : new Date('2099-12-31');
        
        results = results.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= start && dueDate <= end;
        });
      }
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      results = results.filter(task =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Update overdue status
    const now = new Date();
    results = results.map(task => {
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed') {
        return { ...task, status: 'overdue' as const };
      }
      return task;
    });

    return results.sort((a, b) => {
      // Sort by priority first, then by due date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  addComment(taskId: string, text: string, author: string, authorEmail: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const comment: TaskComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      author,
      authorEmail,
      createdAt: new Date().toISOString()
    };

    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    return true;
  }

  updateSubtask(taskId: string, subtaskId: string, completed: boolean, completedBy?: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return false;

    subtask.completed = completed;
    if (completed) {
      subtask.completedBy = completedBy;
      subtask.completedAt = new Date().toISOString();
    } else {
      subtask.completedBy = undefined;
      subtask.completedAt = undefined;
    }

    task.updatedAt = new Date().toISOString();

    // Check if all subtasks are complete
    const allComplete = task.subtasks.every(st => st.completed);
    if (allComplete && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    }

    return true;
  }

  getTaskStats(userId?: string): TaskStats {
    const tasks = userId ? this.getTasks({ assignedTo: userId }) : Array.from(this.tasks.values());
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: TaskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
      dueToday: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      dueThisWeek: tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate <= weekFromNow;
      }).length,
      byStatus: {
        not_started: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
        cancelled: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      byType: {
        compliance: 0,
        deadline: 0,
        review: 0,
        submission: 0,
        payment: 0,
        approval: 0,
        general: 0
      },
      completionRate: 0
    };

    tasks.forEach(task => {
      const status = task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed' ? 'overdue' : task.status;
      stats.byStatus[status]++;
      stats.byPriority[task.priority]++;
      stats.byType[task.type]++;
    });

    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100;

    return stats;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getDependentTasks(taskId: string): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.dependencies.includes(taskId));
  }

  canCompleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    // Check if all dependencies are completed
    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask?.status === 'completed';
    });
  }
}

export const taskManagementService = new TaskManagementService();
