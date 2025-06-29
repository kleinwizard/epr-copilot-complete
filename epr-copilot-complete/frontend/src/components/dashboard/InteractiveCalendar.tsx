
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'reminder' | 'meeting' | 'submission';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'overdue' | 'completed';
  description?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Q4 Report Submission',
    date: new Date(2024, 0, 31),
    type: 'deadline',
    priority: 'critical',
    status: 'upcoming',
    description: 'Submit quarterly packaging data report'
  },
  {
    id: '2',
    title: 'Fee Payment Due',
    date: new Date(2024, 2, 15),
    type: 'deadline',
    priority: 'high',
    status: 'upcoming',
    description: 'Annual EPR compliance fee payment'
  },
  {
    id: '3',
    title: 'Compliance Review Meeting',
    date: new Date(2024, 1, 14),
    type: 'meeting',
    priority: 'medium',
    status: 'upcoming',
    description: 'Monthly compliance status review'
  },
  {
    id: '4',
    title: 'Data Validation Reminder',
    date: new Date(2024, 1, 10),
    type: 'reminder',
    priority: 'medium',
    status: 'upcoming',
    description: 'Review and validate product data'
  }
];

export function InteractiveCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [filter, setFilter] = useState<'all' | 'deadlines' | 'meetings' | 'reminders'>('all');

  const getEventsByDate = (date: Date) => {
    return mockEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return mockEvents
      .filter(event => event.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <AlertTriangle className="h-3 w-3" />;
      case 'meeting': return <CalendarIcon className="h-3 w-3" />;
      case 'reminder': return <Clock className="h-3 w-3" />;
      case 'submission': return <CheckCircle className="h-3 w-3" />;
      default: return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const selectedDateEvents = selectedDate ? getEventsByDate(selectedDate) : [];
  const upcomingEvents = getUpcomingEvents();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <span>Compliance Calendar</span>
            </CardTitle>
            <CardDescription>Deadlines, submissions, and compliance events</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Sync Calendar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} onValueChange={(value) => setView(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasEvents: mockEvents.map(event => event.date)
                  }}
                  modifiersStyles={{
                    hasEvents: { 
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>

              {/* Selected Date Events */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </h4>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(event.type)}
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                          </div>
                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs capitalize">
                              {event.type}
                            </Badge>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No events scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Upcoming Events</h4>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, 'MMM d, yyyy')} • {event.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.type}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-6">
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
