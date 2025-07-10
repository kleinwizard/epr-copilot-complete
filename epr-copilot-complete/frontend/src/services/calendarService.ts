
import { authService } from './authService';

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

export async function getCalendarEvents(month?: number, year?: number): Promise<ComplianceEvent[]> {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return [];
  }
  
  try {
    const params = new URLSearchParams();
    if (month !== undefined) params.append('month', month.toString());
    if (year !== undefined) params.append('year', year.toString());
    
    const response = await fetch(`/api/calendar/events?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    if (month !== undefined && year !== undefined) {
      return mockEvents.filter(event => 
        event.date.getMonth() === month && event.date.getFullYear() === year
      );
    }
    return mockEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}

export async function getUpcomingEvents(days: number = 30): Promise<ComplianceEvent[]> {
  try {
    const response = await fetch(`/api/calendar/events/upcoming?days=${days}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming events');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return mockEvents
      .filter(event => event.date >= now && event.date <= futureDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
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

export async function addCalendarEvent(event: Omit<ComplianceEvent, 'id'>): Promise<ComplianceEvent> {
  try {
    const response = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create calendar event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockEvents.push(newEvent);
    return newEvent;
  }
}

export async function getCalendarStats(): Promise<{upcoming: number, overdue: number, completed: number, critical: number}> {
  const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
  if (!hasOrganizationData) {
    return { upcoming: 0, overdue: 0, completed: 0, critical: 0 };
  }
  
  try {
    const response = await fetch('/api/calendar/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authService.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching calendar stats:', error);
    const now = new Date();
    const upcoming = mockEvents.filter(e => e.date >= now && e.status === 'upcoming').length;
    const overdue = mockEvents.filter(e => e.date < now && e.status !== 'completed').length;
    const completed = mockEvents.filter(e => e.status === 'completed').length;
    const critical = mockEvents.filter(e => e.priority === 'critical' && e.status === 'upcoming').length;
    
    return { upcoming, overdue, completed, critical };
  }
}
