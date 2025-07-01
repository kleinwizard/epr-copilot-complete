
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  entityType: 'document' | 'product' | 'material' | 'fee' | 'report' | 'user' | 'system';
  entityId: string;
  entityName: string;
  description: string;
  changes?: AuditChange[];
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'access' | 'modification' | 'deletion' | 'creation' | 'authentication' | 'compliance';
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'create' | 'update' | 'delete';
}

export type AuditAction = 
  | 'login' | 'logout' | 'failed_login'
  | 'create' | 'read' | 'update' | 'delete'
  | 'approve' | 'reject' | 'submit' | 'withdraw'
  | 'download' | 'upload' | 'share'
  | 'export' | 'import' | 'sync'
  | 'calculate' | 'process' | 'validate';

export interface AuditFilter {
  userId?: string;
  entityType?: AuditEvent['entityType'];
  action?: AuditAction;
  category?: AuditEvent['category'];
  severity?: AuditEvent['severity'];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface AuditReport {
  period: string;
  totalEvents: number;
  eventsByAction: Record<string, number>;
  eventsByUser: Record<string, number>;
  eventsByCategory: Record<string, number>;
  securityEvents: AuditEvent[];
  complianceEvents: AuditEvent[];
  topUsers: Array<{ userId: string; userEmail: string; eventCount: number }>;
}

export class AuditTrailService {
  private events: Map<string, AuditEvent> = new Map();

  constructor() {
    this.loadRealData();
  }

  private loadRealData() {
    const storedEvents = localStorage.getItem('audit_events');
    if (storedEvents) {
      try {
        const events: AuditEvent[] = JSON.parse(storedEvents);
        events.forEach(event => this.events.set(event.id, event));
      } catch (error) {
        console.error('Failed to load audit events from storage:', error);
      }
    }
  }

  private saveToStorage() {
    try {
      const events = Array.from(this.events.values());
      localStorage.setItem('audit_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to save audit events to storage:', error);
    }
  }

  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditEvent: AuditEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString()
    };

    this.events.set(id, auditEvent);
    this.saveToStorage();
    console.log('Audit Event Logged:', auditEvent);
    return auditEvent;
  }

  getEvents(filter: AuditFilter = {}): AuditEvent[] {
    let results = Array.from(this.events.values());

    if (filter.userId) {
      results = results.filter(event => event.userId === filter.userId);
    }

    if (filter.entityType) {
      results = results.filter(event => event.entityType === filter.entityType);
    }

    if (filter.action) {
      results = results.filter(event => event.action === filter.action);
    }

    if (filter.category) {
      results = results.filter(event => event.category === filter.category);
    }

    if (filter.severity) {
      results = results.filter(event => event.severity === filter.severity);
    }

    if (filter.startDate || filter.endDate) {
      const start = filter.startDate ? new Date(filter.startDate) : new Date(0);
      const end = filter.endDate ? new Date(filter.endDate) : new Date();
      
      results = results.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      });
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      results = results.filter(event =>
        event.description.toLowerCase().includes(term) ||
        event.entityName.toLowerCase().includes(term) ||
        event.userEmail.toLowerCase().includes(term)
      );
    }

    return results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getEvent(id: string): AuditEvent | null {
    return this.events.get(id) || null;
  }

  getEventsByEntity(entityType: string, entityId: string): AuditEvent[] {
    return Array.from(this.events.values())
      .filter(event => event.entityType === entityType && event.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getSecurityEvents(days: number = 30): AuditEvent[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return Array.from(this.events.values())
      .filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= cutoffDate && 
               (event.category === 'authentication' || 
                event.action === 'failed_login' ||
                event.severity === 'critical');
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  generateAuditReport(startDate: string, endDate: string): AuditReport {
    const events = this.getEvents({ startDate, endDate });
    
    const eventsByAction: Record<string, number> = {};
    const eventsByUser: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};

    events.forEach(event => {
      // Count by action
      eventsByAction[event.action] = (eventsByAction[event.action] || 0) + 1;
      
      // Count by user
      eventsByUser[event.userEmail] = (eventsByUser[event.userEmail] || 0) + 1;
      
      // Count by category
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
    });

    const topUsers = Object.entries(eventsByUser)
      .map(([userEmail, eventCount]) => ({
        userId: events.find(e => e.userEmail === userEmail)?.userId || '',
        userEmail,
        eventCount
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    const securityEvents = events.filter(e => 
      e.category === 'authentication' || e.severity === 'critical'
    );

    const complianceEvents = events.filter(e => 
      e.category === 'compliance' || e.entityType === 'document'
    );

    return {
      period: `${startDate} to ${endDate}`,
      totalEvents: events.length,
      eventsByAction,
      eventsByUser,
      eventsByCategory,
      securityEvents,
      complianceEvents,
      topUsers
    };
  }

  exportAuditTrail(filter: AuditFilter = {}): string {
    const events = this.getEvents(filter);
    
    const csvHeader = 'Timestamp,User,Action,Entity Type,Entity Name,Description,IP Address,Severity,Category\n';
    const csvRows = events.map(event => 
      `"${event.timestamp}","${event.userEmail}","${event.action}","${event.entityType}","${event.entityName}","${event.description}","${event.ipAddress || ''}","${event.severity}","${event.category}"`
    ).join('\n');

    return csvHeader + csvRows;
  }
}

export const auditTrailService = new AuditTrailService();
