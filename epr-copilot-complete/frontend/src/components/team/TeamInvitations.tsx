
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Send, 
  UserPlus, 
  Mail, 
  Calendar,
  X,
  Check
} from 'lucide-react';
import { getTeamInvitations, inviteTeamMember, TeamInvitation } from '@/services/teamService';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function TeamInvitations() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user' as const,
    department: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadInvitations = async () => {
      setIsLoading(true);
      try {
        const data = await getTeamInvitations();
        setInvitations(data);
      } catch (error) {
        console.error('Failed to load team invitations:', error);
        toast({
          title: "Error",
          description: "Failed to load team invitations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitations();
  }, [toast]);

  const handleSendInvitation = async () => {
    if (!inviteForm.email || !inviteForm.role || !inviteForm.department) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const newInvitation = await inviteTeamMember({
        email: inviteForm.email,
        role: inviteForm.role,
        department: inviteForm.department,
        invitedBy: 'Current User'
      });
      
      setInvitations([...invitations, newInvitation]);
      setInviteForm({ email: '', role: 'user', department: '' });
      setIsInviteDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Invitation sent successfully to ${inviteForm.email}`,
      });
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'accepted': return 'bg-green-50 text-green-700 border-green-200';
      case 'declined': return 'bg-red-50 text-red-700 border-red-200';
      case 'expired': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'user': return 'bg-green-50 text-green-700 border-green-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Invitations</CardTitle>
              <CardDescription>
                Manage pending invitations and invite new team members
              </CardDescription>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your team with the specified role and department.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="e.g., Operations, Product, Finance"
                      value={inviteForm.department}
                      onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendInvitation} disabled={isSending}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Loading invitations...
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No pending invitations
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{invitation.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{invitation.department}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {invitation.invitedBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(invitation.invitedDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(invitation.status)}>
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
