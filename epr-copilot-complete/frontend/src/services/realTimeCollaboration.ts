
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  currentLocation?: {
    section: string;
    reportId: string;
  };
}

export interface RealtimeEdit {
  id: string;
  userId: string;
  reportId: string;
  section: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  status: 'pending' | 'applied' | 'rejected' | 'conflict';
}

export interface Comment {
  id: string;
  userId: string;
  reportId: string;
  section: string;
  field?: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies: CommentReply[];
  mentions: string[];
}

export interface CommentReply {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  mentions: string[];
}

export interface VersionSnapshot {
  id: string;
  reportId: string;
  version: string;
  timestamp: string;
  createdBy: string;
  description: string;
  changes: RealtimeEdit[];
  isAutoSave: boolean;
}

export const mockActiveUsers: CollaborationUser[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    avatar: 'SJ',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    currentLocation: {
      section: 'products',
      reportId: 'Q2-2024'
    }
  },
  {
    id: 'user-2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    avatar: 'MC',
    isOnline: true,
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    currentLocation: {
      section: 'fees',
      reportId: 'Q2-2024'
    }
  }
];

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    userId: 'user-1',
    reportId: 'Q2-2024',
    section: 'products',
    field: 'materials',
    content: 'The plastic weight seems high for this product. Can we verify?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
    replies: [
      {
        id: 'reply-1',
        userId: 'user-2',
        content: 'I\'ll check with the packaging team and update accordingly.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        mentions: ['user-1']
      }
    ],
    mentions: ['user-2']
  }
];

export function subscribeToRealtimeEdits(
  reportId: string,
  onEdit: (edit: RealtimeEdit) => void
): () => void {
  // Mock WebSocket connection
  const interval = setInterval(() => {
    if (Math.random() > 0.8) {
      const mockEdit: RealtimeEdit = {
        id: `edit-${Date.now()}`,
        userId: 'user-2',
        reportId,
        section: 'products',
        field: 'unitsSold',
        oldValue: 1000,
        newValue: 1200,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      onEdit(mockEdit);
    }
  }, 5000);

  return () => clearInterval(interval);
}

export function applyEdit(edit: RealtimeEdit): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Applied edit:', edit);
      resolve(true);
    }, 500);
  });
}

export function createComment(
  reportId: string,
  section: string,
  content: string,
  field?: string,
  mentions: string[] = []
): Promise<Comment> {
  return new Promise((resolve) => {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      reportId,
      section,
      field,
      content,
      timestamp: new Date().toISOString(),
      resolved: false,
      replies: [],
      mentions
    };
    
    setTimeout(() => resolve(comment), 300);
  });
}

export function createVersionSnapshot(
  reportId: string,
  description: string,
  changes: RealtimeEdit[]
): Promise<VersionSnapshot> {
  return new Promise((resolve) => {
    const snapshot: VersionSnapshot = {
      id: `version-${Date.now()}`,
      reportId,
      version: `v${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 10)}`,
      timestamp: new Date().toISOString(),
      createdBy: 'current-user',
      description,
      changes,
      isAutoSave: false
    };
    
    setTimeout(() => resolve(snapshot), 500);
  });
}
