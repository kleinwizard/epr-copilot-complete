import { APP_CONFIG } from '../config/constants';
import { authService } from './authService';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  activeConversations: number;
  messagesSentToday: number;
  messagesReceivedToday: number;
}

class CommunicationService {
  private apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = authService.getAccessToken();
    const response = await fetch(`${APP_CONFIG.api.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  async getMessages(): Promise<Message[]> {
    try {
      const data = await this.apiCall('/api/messages');
      return data.messages || [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await this.apiCall('/api/messages/conversations');
      return data.conversations || [];
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      return [];
    }
  }

  async getCommunicationStats(): Promise<CommunicationStats> {
    try {
      const data = await this.apiCall('/api/messages/stats');
      return data;
    } catch (error) {
      console.error('Failed to fetch communication stats:', error);
      return {
        totalMessages: 0,
        unreadMessages: 0,
        activeConversations: 0,
        messagesSentToday: 0,
        messagesReceivedToday: 0
      };
    }
  }

  async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
    try {
      const data = await this.apiCall('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });
      return data.message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await this.apiCall(`/api/messages/${messageId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  async getUnreadMessages(): Promise<Message[]> {
    try {
      const data = await this.apiCall('/api/messages/unread');
      return data.messages || [];
    } catch (error) {
      console.error('Failed to fetch unread messages:', error);
      return [];
    }
  }
}

export const communicationService = new CommunicationService();

export const getMessages = () => communicationService.getMessages();
export const getConversations = () => communicationService.getConversations();
export const getCommunicationStats = () => communicationService.getCommunicationStats();
export const sendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => 
  communicationService.sendMessage(message);
export const markMessageAsRead = (messageId: string) => 
  communicationService.markMessageAsRead(messageId);
export const getUnreadMessages = () => communicationService.getUnreadMessages();
