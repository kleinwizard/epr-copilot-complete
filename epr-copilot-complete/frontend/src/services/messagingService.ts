
import { Message, Channel, ChannelMember } from '../types/communication';

export class MessagingService {
  private messages: Map<string, Message[]> = new Map();
  private channels: Map<string, Channel> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock channels
    const generalChannel: Channel = {
      id: 'general',
      name: 'General',
      description: 'General company discussions',
      type: 'public',
      members: [
        {
          userId: 'user-1',
          userName: 'Sarah Johnson',
          role: 'admin',
          joinedAt: '2024-01-15T09:00:00Z',
          isOnline: true,
          lastSeen: new Date().toISOString()
        },
        {
          userId: 'user-2',
          userName: 'Mike Chen',
          role: 'member',
          joinedAt: '2024-01-16T10:30:00Z',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      createdBy: 'user-1',
      createdAt: '2024-01-15T09:00:00Z',
      lastActivity: new Date().toISOString(),
      isArchived: false
    };

    this.channels.set(generalChannel.id, generalChannel);

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        senderId: 'user-1',
        senderName: 'Sarah Johnson',
        channelId: 'general',
        content: 'Welcome to the Oregon EPR compliance platform!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        type: 'text',
        isRead: true,
        reactions: []
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        senderName: 'Mike Chen',
        channelId: 'general',
        content: 'Thanks! Looking forward to working together on compliance.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'text',
        isRead: false,
        reactions: []
      }
    ];

    this.messages.set('general', mockMessages);
  }

  getChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  getChannelById(channelId: string): Channel | undefined {
    return this.channels.get(channelId);
  }

  getMessages(channelId: string): Message[] {
    return this.messages.get(channelId) || [];
  }

  async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const channelId = message.channelId || 'general';
    const channelMessages = this.messages.get(channelId) || [];
    channelMessages.push(newMessage);
    this.messages.set(channelId, channelMessages);

    // Update channel last activity
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.lastActivity = newMessage.timestamp;
    }

    return newMessage;
  }

  async createChannel(channelData: Omit<Channel, 'id' | 'createdAt' | 'lastActivity'>): Promise<Channel> {
    const newChannel: Channel = {
      ...channelData,
      id: `channel-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.channels.set(newChannel.id, newChannel);
    this.messages.set(newChannel.id, []);

    return newChannel;
  }

  markMessageAsRead(messageId: string, channelId: string): boolean {
    const messages = this.messages.get(channelId);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.isRead = true;
        return true;
      }
    }
    return false;
  }

  getUnreadCount(channelId: string): number {
    const messages = this.messages.get(channelId) || [];
    return messages.filter(m => !m.isRead).length;
  }
}

export const messagingService = new MessagingService();
