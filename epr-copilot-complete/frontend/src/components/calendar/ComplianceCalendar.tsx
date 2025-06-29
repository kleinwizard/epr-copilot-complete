
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Filter, Bell } from 'lucide-react';
import { CalendarGrid } from './CalendarGrid';
import { EventsList } from './EventsList';
import { CalendarStats } from './CalendarStats';
import { EventFilters } from './EventFilters';
import { getCalendarEvents, getUpcomingEvents, type ComplianceEvent } from '@/services/calendarService';

export function ComplianceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all',
    jurisdiction: 'all'
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthEvents = getCalendarEvents(currentMonth, currentYear);
  const upcomingEvents = getUpcomingEvents(30);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Calendar</h2>
          <p className="text-muted-foreground">
            Track deadlines, submissions, and compliance events
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Stats */}
      <CalendarStats />

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <EventFilters filters={selectedFilters} onFiltersChange={setSelectedFilters} />
          
          <div className="flex border rounded-md">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Month
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {view === 'month' ? (
        <CalendarGrid 
          currentDate={currentDate} 
          events={monthEvents}
          filters={selectedFilters}
        />
      ) : (
        <EventsList 
          events={upcomingEvents}
          filters={selectedFilters}
          title="Upcoming Events"
        />
      )}
    </div>
  );
}
