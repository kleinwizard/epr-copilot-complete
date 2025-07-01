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

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'user1',
    senderName: 'John Doe',
    recipientId: 'user2',
    recipientName: 'Sarah Wilson',
    subject: 'Q4 Report Review',
    content: 'Please review the Q4 compliance report before submission.',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'read',
    priority: 'high'
  },
  {
    id: '2',
    senderId: 'user2',
    senderName: 'Sarah Wilson',
    recipientId: 'user1',
    recipientName: 'John Doe',
    subject: 'Material Classification Update',
    content: 'Updated the material classifications for new products.',
    timestamp: '2024-01-20T09:15:00Z',
    status: 'delivered',
    priority: 'medium'
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: ['user1', 'user2'],
    participantNames: ['John Doe', 'Sarah Wilson'],
    lastMessage: mockMessages[0],
    unreadCount: 0,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  }
];

export const getMessages = (): Message[] => {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return [];
  }
  return mockMessages.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const getConversations = (): Conversation[] => {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return [];
  }
  return mockConversations.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export const getCommunicationStats = (): CommunicationStats => {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return {
      totalMessages: 0,
      unreadMessages: 0,
      activeConversations: 0,
      messagesSentToday: 0,
      messagesReceivedToday: 0
    };
  }
  
  const messages = getMessages();
  const conversations = getConversations();
  const today = new Date().toDateString();
  
  return {
    totalMessages: messages.length,
    unreadMessages: messages.filter(m => m.status !== 'read').length,
    activeConversations: conversations.length,
    messagesSentToday: messages.filter(m => 
      new Date(m.timestamp).toDateString() === today
    ).length,
    messagesReceivedToday: messages.filter(m => 
      new Date(m.timestamp).toDateString() === today
    ).length
  };
};

export const sendMessage = (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    status: 'sent'
  };
  mockMessages.push(newMessage);
  return newMessage;
};

export const markMessageAsRead = (messageId: string) => {
  const message = mockMessages.find(m => m.id === messageId);
  if (message) {
    message.status = 'read';
  }
};

export const getUnreadMessages = (): Message[] => {
  const messages = getMessages();
  return messages.filter(m => m.status !== 'read');
};
