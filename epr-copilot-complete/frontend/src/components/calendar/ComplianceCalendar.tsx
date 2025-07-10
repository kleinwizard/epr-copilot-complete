
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Filter, Bell } from 'lucide-react';
import { CalendarGrid } from './CalendarGrid';
import { EventsList } from './EventsList';
import { CalendarStats } from './CalendarStats';
import { EventFilters } from './EventFilters';
import { getCalendarEvents, getUpcomingEvents, type ComplianceEvent } from '@/services/calendarService';
import { useCalendarStore } from '@/store/calendarStore';
import { useToast } from '@/hooks/use-toast';

export function ComplianceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'list'>('month');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all',
    jurisdiction: 'all'
  });
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showAddNotificationDialog, setShowAddNotificationDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: '',
    priority: 'medium',
    jurisdiction: ''
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'reminder',
    triggerDate: '',
    eventId: '',
    recipients: 'all'
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { events, isLoading, error, addEvent, fetchEvents } = useCalendarStore();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  useEffect(() => {
    fetchEvents(currentMonth, currentYear);
  }, [currentDate, fetchEvents]);

  const monthEvents = events.filter(event => 
    event.date.getMonth() === currentMonth && event.date.getFullYear() === currentYear
  );
  const upcomingEvents = events.filter(event => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return event.date >= now && event.date <= futureDate;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

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

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventDate = new Date(newEvent.date);
      
      const complianceEvent: Omit<ComplianceEvent, 'id'> = {
        title: newEvent.title,
        description: newEvent.description,
        date: eventDate,
        type: newEvent.type as ComplianceEvent['type'],
        status: 'upcoming',
        priority: newEvent.priority as ComplianceEvent['priority'],
        category: 'data-submission',
        jurisdiction: newEvent.jurisdiction || undefined,
        reminderDays: [7, 3, 1]
      };

      await addEvent(complianceEvent);
      
      setShowAddEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        type: '',
        priority: 'medium',
        jurisdiction: ''
      });
      
      toast({
        title: "Event Added",
        description: `Event "${newEvent.title}" has been added successfully!`,
      });
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const handleAddNotification = () => {
    if (!newNotification.title || !newNotification.triggerDate || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('Adding new notification:', newNotification);
    
    setShowAddNotificationDialog(false);
    setNewNotification({
      title: '',
      message: '',
      type: 'reminder',
      triggerDate: '',
      eventId: '',
      recipients: 'all'
    });
    
    toast({
      title: "Notification Added",
      description: `Notification "${newNotification.title}" has been scheduled successfully!`,
    });
  };

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
          <Dialog open={showAddNotificationDialog} onOpenChange={setShowAddNotificationDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Add Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-title">Notification Title *</Label>
                  <Input
                    id="notif-title"
                    placeholder="Enter notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notif-message">Message *</Label>
                  <Textarea
                    id="notif-message"
                    placeholder="Enter notification message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notif-type">Notification Type</Label>
                  <Select value={newNotification.type} onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="deadline">Deadline Alert</SelectItem>
                      <SelectItem value="update">Status Update</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notif-date">Trigger Date *</Label>
                  <Input
                    id="notif-date"
                    type="datetime-local"
                    value={newNotification.triggerDate}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, triggerDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notif-recipients">Recipients</Label>
                  <Select value={newNotification.recipients} onValueChange={(value) => setNewNotification(prev => ({ ...prev, recipients: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Team Members</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="managers">Managers Only</SelectItem>
                      <SelectItem value="me">Just Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddNotificationDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddNotification}>
                    Schedule Notification
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Compliance Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter event description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="submission">Submission</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newEvent.priority} onValueChange={(value) => setNewEvent(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    placeholder="Enter jurisdiction (e.g., Oregon, California)"
                    value={newEvent.jurisdiction}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent}>
                    Add Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
          key={`month-${refreshKey}`}
          currentDate={currentDate} 
          events={monthEvents}
          filters={selectedFilters}
        />
      ) : (
        <EventsList 
          key={`list-${refreshKey}`}
          events={upcomingEvents}
          filters={selectedFilters}
          title="Upcoming Events"
        />
      )}
    </div>
  );
}
