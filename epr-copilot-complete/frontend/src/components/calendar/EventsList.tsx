
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  DollarSign,
  Users,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComplianceEvent } from '@/services/calendarService';

interface EventsListProps {
  events: ComplianceEvent[];
  filters: {
    type: string;
    priority: string;
    status: string;
    jurisdiction: string;
  };
  title: string;
}

export function EventsList({ events, filters, title }: EventsListProps) {
  const filterEvents = (eventList: ComplianceEvent[]) => {
    return eventList.filter(event => {
      if (filters.type !== 'all' && event.type !== filters.type) return false;
      if (filters.priority !== 'all' && event.priority !== filters.priority) return false;
      if (filters.status !== 'all' && event.status !== filters.status) return false;
      if (filters.jurisdiction !== 'all' && event.jurisdiction !== filters.jurisdiction) return false;
      return true;
    });
  };

  const filteredEvents = filterEvents(events);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline': return AlertTriangle;
      case 'reminder': return Clock;
      case 'submission': return FileText;
      case 'meeting': return Users;
      default: return Calendar;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quarterly-report': return FileText;
      case 'fee-payment': return DollarSign;
      case 'data-submission': return Database;
      case 'audit': return Users;
      default: return Calendar;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{title}</span>
          <Badge variant="secondary">{filteredEvents.length}</Badge>
        </CardTitle>
        <CardDescription>
          Upcoming compliance deadlines and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or add new compliance events.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => {
              const EventIcon = getEventIcon(event.type);
              const CategoryIcon = getCategoryIcon(event.category);
              const isOverdue = event.date < new Date() && event.status !== 'completed';
              
              return (
                <div
                  key={event.id}
                  className={cn(
                    "p-4 border rounded-lg transition-colors hover:bg-gray-50",
                    isOverdue && "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isOverdue ? "bg-red-100" : "bg-blue-100"
                      )}>
                        <EventIcon className={cn(
                          "h-4 w-4",
                          isOverdue ? "text-red-600" : "text-blue-600"
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                            {event.priority}
                          </Badge>
                          <Badge className={cn("text-xs", getStatusColor(event.status))}>
                            {event.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <CategoryIcon className="h-3 w-3" />
                            <span className="capitalize">{event.category.replace('-', ' ')}</span>
                          </div>
                          
                          {event.jurisdiction && (
                            <div className="flex items-center space-x-1">
                              <span>{event.jurisdiction}</span>
                            </div>
                          )}
                          
                          <div className={cn(
                            "font-medium",
                            isOverdue ? "text-red-600" : "text-blue-600"
                          )}>
                            {getDaysUntil(event.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {event.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
