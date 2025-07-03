
export interface ComplianceEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'deadline' | 'reminder' | 'submission' | 'meeting';
  status: 'upcoming' | 'overdue' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'quarterly-report' | 'annual-report' | 'fee-payment' | 'data-submission' | 'audit' | 'registration';
  jurisdiction?: string;
  relatedItems?: string[];
  reminderDays?: number[];
}

export interface CalendarView {
  month: number;
  year: number;
  events: ComplianceEvent[];
}

const mockEvents: ComplianceEvent[] = [];

export function getCalendarEvents(month?: number, year?: number): ComplianceEvent[] {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return [];
  }
  
  if (month !== undefined && year !== undefined) {
    return mockEvents.filter(event => 
      event.date.getMonth() === month && event.date.getFullYear() === year
    );
  }
  return mockEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getUpcomingEvents(days: number = 30): ComplianceEvent[] {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return mockEvents
    .filter(event => event.date >= now && event.date <= futureDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getOverdueEvents(): ComplianceEvent[] {
  const now = new Date();
  return mockEvents
    .filter(event => event.date < now && event.status !== 'completed')
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getEventsByPriority(priority: ComplianceEvent['priority']): ComplianceEvent[] {
  return mockEvents.filter(event => event.priority === priority);
}

export function updateEventStatus(eventId: string, status: ComplianceEvent['status']): void {
  const event = mockEvents.find(e => e.id === eventId);
  if (event) {
    event.status = status;
  }
}

export function addCalendarEvent(event: Omit<ComplianceEvent, 'id'>): ComplianceEvent {
  const newEvent = {
    ...event,
    id: Math.random().toString(36).substr(2, 9)
  };
  mockEvents.push(newEvent);
  return newEvent;
}

export function getCalendarStats() {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return { upcoming: 0, overdue: 0, completed: 0, critical: 0 };
  }
  
  const now = new Date();
  const upcoming = mockEvents.filter(e => e.date >= now && e.status === 'upcoming').length;
  const overdue = mockEvents.filter(e => e.date < now && e.status !== 'completed').length;
  const completed = mockEvents.filter(e => e.status === 'completed').length;
  const critical = mockEvents.filter(e => e.priority === 'critical' && e.status === 'upcoming').length;
  
  return { upcoming, overdue, completed, critical };
}
