
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId?: string;
  channelId?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'system' | 'notification';
  isRead: boolean;
  attachments?: MessageAttachment[];
  mentions?: string[];
  threadId?: string;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'audio';
  size: number;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  members: ChannelMember[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  isArchived: boolean;
}

export interface ChannelMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface VendorProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
  description?: string;
  categories: string[];
  certifications: string[];
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  lastActive: string;
  rating: number;
  reviewCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  type: 'project' | 'department' | 'vendor' | 'compliance';
  members: WorkspaceMember[];
  channels: string[];
  documents: WorkspaceDocument[];
  createdBy: string;
  createdAt: string;
  isPrivate: boolean;
  tags: string[];
}

export interface WorkspaceMember {
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: string;
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: 'report' | 'policy' | 'procedure' | 'template' | 'other';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  tags: string[];
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  rating: number;
  ratingCount: number;
  isPublic: boolean;
  relatedArticles: string[];
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
  articleCount: number;
  order: number;
}
