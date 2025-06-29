
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

// Mock data for compliance calendar
const mockEvents: ComplianceEvent[] = [
  {
    id: '1',
    title: 'Q4 2024 EPR Report Due',
    description: 'Submit quarterly packaging data report to environmental agency',
    date: new Date('2024-01-31'),
    type: 'deadline',
    status: 'upcoming',
    priority: 'critical',
    category: 'quarterly-report',
    jurisdiction: 'California',
    reminderDays: [30, 14, 7, 1]
  },
  {
    id: '2',
    title: 'Annual Fee Payment',
    description: 'Pay annual EPR compliance fees based on 2024 data',
    date: new Date('2024-03-15'),
    type: 'deadline',
    status: 'upcoming',
    priority: 'high',
    category: 'fee-payment',
    jurisdiction: 'California',
    reminderDays: [30, 7]
  },
  {
    id: '3',
    title: 'Product Registration Update',
    description: 'Update product catalog for new items introduced in Q4',
    date: new Date('2024-02-28'),
    type: 'submission',
    status: 'upcoming',
    priority: 'medium',
    category: 'data-submission',
    jurisdiction: 'California',
    reminderDays: [14, 3]
  },
  {
    id: '4',
    title: 'Compliance Audit Preparation',
    description: 'Prepare documentation for annual compliance audit',
    date: new Date('2024-04-10'),
    type: 'meeting',
    status: 'upcoming',
    priority: 'high',
    category: 'audit',
    jurisdiction: 'California',
    reminderDays: [21, 7]
  },
  {
    id: '5',
    title: 'Q1 2025 Data Submission',
    description: 'Submit Q1 packaging data and material declarations',
    date: new Date('2024-04-30'),
    type: 'deadline',
    status: 'upcoming',
    priority: 'critical',
    category: 'quarterly-report',
    jurisdiction: 'California',
    reminderDays: [30, 14, 7, 1]
  }
];

export function getCalendarEvents(month?: number, year?: number): ComplianceEvent[] {
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
  const now = new Date();
  const upcoming = mockEvents.filter(e => e.date >= now && e.status === 'upcoming').length;
  const overdue = mockEvents.filter(e => e.date < now && e.status !== 'completed').length;
  const completed = mockEvents.filter(e => e.status === 'completed').length;
  const critical = mockEvents.filter(e => e.priority === 'critical' && e.status === 'upcoming').length;
  
  return { upcoming, overdue, completed, critical };
}
