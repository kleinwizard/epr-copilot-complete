
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { getCalendarStats, getUpcomingEvents, getOverdueEvents } from '@/services/calendarService';

export function CalendarStats() {
  const stats = getCalendarStats();
  const upcomingEvents = getUpcomingEvents(7); // Next 7 days
  const overdueEvents = getOverdueEvents();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <CalendarDays className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcoming}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {upcomingEvents.length} this week
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active compliance events
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="mt-2">
            {stats.overdue > 0 ? (
              <Badge variant="destructive" className="text-xs">
                Needs attention
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                All caught up
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Past due deadlines
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              This quarter
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Successfully submitted
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
          <div className="mt-2">
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
              High priority
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requires immediate attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
