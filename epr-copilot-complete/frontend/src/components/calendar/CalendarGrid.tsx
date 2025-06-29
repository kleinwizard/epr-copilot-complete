
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ComplianceEvent } from '@/services/calendarService';

interface CalendarGridProps {
  currentDate: Date;
  events: ComplianceEvent[];
  filters: {
    type: string;
    priority: string;
    status: string;
    jurisdiction: string;
  };
}

export function CalendarGrid({ currentDate, events, filters }: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const filterEvents = (dayEvents: ComplianceEvent[]) => {
    return dayEvents.filter(event => {
      if (filters.type !== 'all' && event.type !== filters.type) return false;
      if (filters.priority !== 'all' && event.priority !== filters.priority) return false;
      if (filters.status !== 'all' && event.status !== filters.status) return false;
      if (filters.jurisdiction !== 'all' && event.jurisdiction !== filters.jurisdiction) return false;
      return true;
    });
  };

  const getEventsForDay = (day: number) => {
    const dayEvents = events.filter(event => event.date.getDate() === day);
    return filterEvents(dayEvents);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'border-l-red-500';
      case 'reminder': return 'border-l-yellow-500';
      case 'submission': return 'border-l-blue-500';
      case 'meeting': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardContent className="p-6">
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-sm font-medium text-center text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-24" />;
            }

            const dayEvents = getEventsForDay(day);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day}
                className={cn(
                  "h-24 p-2 border rounded-lg transition-colors hover:bg-gray-50",
                  isCurrentDay && "bg-blue-50 border-blue-200"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentDay ? "text-blue-700" : "text-gray-900"
                )}>
                  {day}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded border-l-2 bg-white shadow-sm truncate",
                        getTypeColor(event.type)
                      )}
                      title={event.title}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={cn("w-2 h-2 rounded-full", getPriorityColor(event.priority))} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
