
import { apiService } from './apiService';

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
  oldValue: unknown;
  newValue: unknown;
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

class RealTimeCollaborationService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async getActiveUsers(reportId: string): Promise<CollaborationUser[]> {
    try {
      const users = await apiService.get(`/api/collaboration/users?reportId=${reportId}`);
      return users || [];
    } catch (error) {
      console.error('Failed to get active users:', error);
      return [];
    }
  }

  async getComments(reportId: string): Promise<Comment[]> {
    try {
      const comments = await apiService.get(`/api/reports/${reportId}/comments`);
      return comments || [];
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  subscribeToRealtimeEdits(
    reportId: string,
    onEdit: (edit: RealtimeEdit) => void
  ): () => void {
    // In production, this would establish a WebSocket connection
    console.log('Real-time collaboration is not yet implemented');
    return () => {
    };
  }

  async applyEdit(edit: RealtimeEdit): Promise<boolean> {
    try {
      await apiService.post(`/api/reports/${edit.reportId}/edits`, edit);
      return true;
    } catch (error) {
      console.error('Failed to apply edit:', error);
      return false;
    }
  }

  async createComment(
    reportId: string,
    section: string,
    content: string,
    field?: string,
    mentions: string[] = []
  ): Promise<Comment> {
    try {
      const comment = await apiService.post(`/api/reports/${reportId}/comments`, {
        section,
        field,
        content,
        mentions
      });
      return comment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      throw error;
    }
  }

  async createVersionSnapshot(
    reportId: string,
    description: string,
    changes: RealtimeEdit[]
  ): Promise<VersionSnapshot> {
    try {
      const snapshot = await apiService.post(`/api/reports/${reportId}/snapshots`, {
        description,
        changes
      });
      return snapshot;
    } catch (error) {
      console.error('Failed to create version snapshot:', error);
      throw error;
    }
  }
}

export const realTimeCollaborationService = new RealTimeCollaborationService();

export const subscribeToRealtimeEdits = (reportId: string, onEdit: (edit: RealtimeEdit) => void) => 
  realTimeCollaborationService.subscribeToRealtimeEdits(reportId, onEdit);

export const applyEdit = (edit: RealtimeEdit) => 
  realTimeCollaborationService.applyEdit(edit);

export const createComment = (reportId: string, section: string, content: string, field?: string, mentions: string[] = []) =>
  realTimeCollaborationService.createComment(reportId, section, content, field, mentions);

export const createVersionSnapshot = (reportId: string, description: string, changes: RealtimeEdit[]) =>
  realTimeCollaborationService.createVersionSnapshot(reportId, description, changes);
