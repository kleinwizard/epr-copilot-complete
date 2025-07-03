
import { useState } from 'react';
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
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    type: '',
    priority: 'medium',
    jurisdiction: ''
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

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.type) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Adding new event:', newEvent);
    
    setShowAddEventDialog(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      type: '',
      priority: 'medium',
      jurisdiction: ''
    });
    
    alert(`Event "${newEvent.title}" has been added successfully!`);
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
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/notifications'}>
            <Bell className="h-4 w-4 mr-2" />
            Add Notification
          </Button>
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
