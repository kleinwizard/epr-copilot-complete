
export interface ReportCollaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

export interface ReportComment {
  id: string;
  content: string;
  author: ReportCollaborator;
  createdAt: string;
  updatedAt?: string;
  resolved: boolean;
  replies: ReportComment[];
  position?: {
    section: string;
    x: number;
    y: number;
  };
}

export interface ReportVersion {
  id: string;
  version: string;
  title: string;
  author: ReportCollaborator;
  createdAt: string;
  changes: string[];
  isCurrent: boolean;
}

export interface ReportActivity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'shared' | 'exported';
  description: string;
  author: ReportCollaborator;
  timestamp: string;
  metadata?: any;
}
