import { create } from 'zustand';
import { ComplianceEvent } from '@/services/calendarService';
import { API_CONFIG } from '@/config/api.config';
import { authService } from '@/services/authService';

interface CalendarStore {
  events: ComplianceEvent[];
  isLoading: boolean;
  error: string | null;
  addEvent: (event: Omit<ComplianceEvent, 'id'>) => Promise<ComplianceEvent>;
  updateEvent: (id: string, event: Partial<ComplianceEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchEvents: (month?: number, year?: number) => Promise<void>;
}

function generateMockEvents(month?: number, year?: number): ComplianceEvent[] {
  const mockEvents: ComplianceEvent[] = [
    {
      id: 'mock-1',
      title: 'Q1 EPR Report Due',
      description: 'Submit quarterly EPR compliance report',
      date: new Date(2024, 2, 31),
      type: 'deadline',
      status: 'upcoming',
      priority: 'high',
      category: 'quarterly-report',
      jurisdiction: 'Oregon',
      reminderDays: [7, 3, 1]
    },
    {
      id: 'mock-2',
      title: 'Fee Payment Due',
      description: 'Pay EPR fees for Q4 2023',
      date: new Date(2024, 3, 15),
      type: 'deadline',
      status: 'upcoming',
      priority: 'critical',
      category: 'fee-payment',
      jurisdiction: 'California',
      reminderDays: [14, 7, 3, 1]
    }
  ];

  if (month !== undefined && year !== undefined) {
    return mockEvents.filter(event => 
      event.date.getMonth() === month && event.date.getFullYear() === year
    );
  }
  
  return mockEvents;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  addEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const token = authService.getAccessToken();
      const response = await fetch(API_CONFIG.getApiUrl('/calendar/events'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create event');
      }
      
      const newEvent = await response.json();
      set(state => ({
        events: [...state.events, newEvent],
        isLoading: false
      }));
      return newEvent;
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        const newEvent: ComplianceEvent = {
          ...eventData,
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date(eventData.date),
        };
        set(state => ({
          events: [...state.events, newEvent],
          isLoading: false
        }));
        return newEvent;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to add event',
        isLoading: false
      });
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const token = authService.getAccessToken();
      const response = await fetch(API_CONFIG.getApiUrl(`/calendar/events/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update event');
      }
      
      const updatedEvent = await response.json();
      set(state => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updatedEvent } : event
        ),
        isLoading: false
      }));
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        set(state => ({
          events: state.events.map(event => 
            event.id === id ? { ...event, ...eventData } : event
          ),
          isLoading: false
        }));
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to update event',
        isLoading: false
      });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = authService.getAccessToken();
      const response = await fetch(API_CONFIG.getApiUrl(`/calendar/events/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete event');
      }
      
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        isLoading: false
      }));
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        set(state => ({
          events: state.events.filter(event => event.id !== id),
          isLoading: false
        }));
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to delete event',
        isLoading: false
      });
      throw error;
    }
  },

  fetchEvents: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (month !== undefined) params.append('month', month.toString());
      if (year !== undefined) params.append('year', year.toString());
      
      const token = authService.getAccessToken();
      const response = await fetch(
        API_CONFIG.getApiUrl(`/calendar/events?${params.toString()}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const events = await response.json();
      set({
        events: events.map((e: any) => ({
          ...e,
          date: new Date(e.date)
        })),
        isLoading: false
      });
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        set({
          events: generateMockEvents(month, year),
          isLoading: false
        });
        return;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch events',
        isLoading: false
      });
    }
  }
}));
