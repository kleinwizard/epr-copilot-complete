
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supportService } from '@/services/supportService';
import { SupportTicket } from '@/types/support';
import { MessageSquare, Mail, Phone, Clock, AlertCircle, CheckCircle, User } from 'lucide-react';

export const SupportChannels = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as const,
    category: '',
    status: 'open' as const
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const ticketsData = await supportService.getSupportTickets();
    setTickets(ticketsData);
  };

  const handleCreateTicket = async () => {
    const ticket = await supportService.createSupportTicket(newTicket);
    setTickets([ticket, ...tickets]);
    setShowCreateTicket(false);
    setNewTicket({
      subject: '',
      description: '',
      priority: 'medium',
      category: '',
      status: 'open'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" data-tutorial="support">
      {/* Support Channel Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Live Chat
            </CardTitle>
            <CardDescription>Get instant help from our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Available now
              </div>
              <p className="text-sm text-gray-600">Average response time: 2 minutes</p>
              <Button className="w-full">Start Chat</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-green-500" />
              Email Support
            </CardTitle>
            <CardDescription>Send us a detailed message</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Average response time: 2-4 hours</p>
              <p className="text-sm text-gray-600">Best for complex issues</p>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-purple-500" />
              Phone Support
            </CardTitle>
            <CardDescription>Speak directly with our experts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Business hours: 9 AM - 6 PM PST</p>
              <p className="text-sm font-medium">+1 (555) 123-4567</p>
              <Button variant="outline" className="w-full">
                Schedule Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track your support requests</CardDescription>
            </div>
            <Button onClick={() => setShowCreateTicket(true)}>
              Create Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateTicket && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                          <SelectItem value="General Question">General Question</SelectItem>
                          <SelectItem value="Feature Request">Feature Request</SelectItem>
                          <SelectItem value="Account Issue">Account Issue</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of your issue..."
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleCreateTicket}>Create Ticket</Button>
                    <Button variant="outline" onClick={() => setShowCreateTicket(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {tickets.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>#{ticket.id}</span>
                        <span>{ticket.category}</span>
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                        <span>Updated: {formatDate(ticket.updatedAt)}</span>
                        {ticket.assignedTo && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{ticket.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No support tickets yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
