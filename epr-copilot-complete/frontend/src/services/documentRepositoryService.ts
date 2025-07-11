
export interface Document {
  id: string;
  name: string;
  type: 'report' | 'certificate' | 'invoice' | 'contract' | 'policy' | 'manual' | 'other';
  category: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'expired' | 'archived';
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  expiryDate?: string;
  tags: string[];
  metadata: Record<string, any>;
  permissions: DocumentPermission[];
  approvalRequired: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  parentId?: string;
  children?: Document[];
}

export interface DocumentPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedBy: string;
  grantedAt: string;
}

export interface DocumentSearchFilter {
  type?: Document['type'];
  category?: string;
  status?: Document['status'];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  uploadedBy?: string;
  searchTerm?: string;
}

export class DocumentRepositoryService {
  private documents: Map<string, Document> = new Map();
  private storageKey = 'epr_documents';

  constructor() {
    this.loadRealData();
  }

  private loadRealData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const docs: Document[] = JSON.parse(stored);
        docs.forEach(doc => this.documents.set(doc.id, doc));
      }
    } catch (error) {
      console.error('Failed to load documents from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const docs = Array.from(this.documents.values());
      localStorage.setItem(this.storageKey, JSON.stringify(docs));
    } catch (error) {
      console.error('Failed to save documents to storage:', error);
    }
  }

  createDocument(doc: Omit<Document, 'id' | 'uploadedAt' | 'lastModified'>): Document {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: Document = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.documents.set(id, newDoc);
    this.saveToStorage();
    return newDoc;
  }

  getDocument(id: string): Document | null {
    return this.documents.get(id) || null;
  }

  searchDocuments(filter: DocumentSearchFilter = {}): Document[] {
    let results = Array.from(this.documents.values());

    if (filter.type) {
      results = results.filter(doc => doc.type === filter.type);
    }

    if (filter.category) {
      results = results.filter(doc => doc.category === filter.category);
    }

    if (filter.status) {
      results = results.filter(doc => doc.status === filter.status);
    }

    if (filter.tags && filter.tags.length > 0) {
      results = results.filter(doc => 
        filter.tags!.some(tag => doc.tags.includes(tag))
      );
    }

    if (filter.uploadedBy) {
      results = results.filter(doc => doc.uploadedBy === filter.uploadedBy);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      results = results.filter(doc => 
        doc.name.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      results = results.filter(doc => {
        const uploadDate = new Date(doc.uploadedAt);
        return uploadDate >= start && uploadDate <= end;
      });
    }

    return results.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  }

  updateDocument(id: string, updates: Partial<Document>): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    const updatedDoc = {
      ...doc,
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.documents.set(id, updatedDoc);
    return true;
  }

  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  getDocumentsByCategory(): Map<string, Document[]> {
    const categorized = new Map<string, Document[]>();
    
    this.documents.forEach(doc => {
      if (!categorized.has(doc.category)) {
        categorized.set(doc.category, []);
      }
      categorized.get(doc.category)!.push(doc);
    });

    return categorized;
  }

  getExpiringDocuments(days: number = 30): Document[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return Array.from(this.documents.values()).filter(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate <= cutoffDate && expiryDate > new Date();
    });
  }

  addPermission(documentId: string, permission: DocumentPermission): boolean {
    const doc = this.documents.get(documentId);
    if (!doc) return false;

    doc.permissions.push(permission);
    doc.lastModified = new Date().toISOString();
    return true;
  }

  removePermission(documentId: string, userId: string): boolean {
    const doc = this.documents.get(documentId);
    if (!doc) return false;

    doc.permissions = doc.permissions.filter(p => p.userId !== userId);
    doc.lastModified = new Date().toISOString();
    return true;
  }
}

export const documentRepositoryService = new DocumentRepositoryService();
