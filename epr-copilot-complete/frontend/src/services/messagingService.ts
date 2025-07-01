
import { Message, Channel, ChannelMember } from '../types/communication';

export class MessagingService {
  private messages: Map<string, Message[]> = new Map();
  private channels: Map<string, Channel> = new Map();

  constructor() {
    this.loadRealData();
  }

  private loadRealData() {
    const storedChannels = localStorage.getItem('epr_messaging_channels');
    const storedMessages = localStorage.getItem('epr_messaging_messages');
    
    if (storedChannels) {
      const channels = JSON.parse(storedChannels);
      channels.forEach((channel: Channel) => {
        this.channels.set(channel.id, channel);
      });
    }
    
    if (storedMessages) {
      const messages = JSON.parse(storedMessages);
      Object.entries(messages).forEach(([channelId, channelMessages]) => {
        this.messages.set(channelId, channelMessages as Message[]);
      });
    }
    
    if (this.channels.size === 0) {
      const generalChannel: Channel = {
        id: 'general',
        name: 'General',
        description: 'General company discussions',
        type: 'public',
        members: [],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isArchived: false
      };
      this.channels.set(generalChannel.id, generalChannel);
      this.messages.set('general', []);
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    const channelsArray = Array.from(this.channels.values());
    const messagesObject = Object.fromEntries(this.messages.entries());
    
    localStorage.setItem('epr_messaging_channels', JSON.stringify(channelsArray));
    localStorage.setItem('epr_messaging_messages', JSON.stringify(messagesObject));
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
