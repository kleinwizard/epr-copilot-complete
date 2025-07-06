import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Mail, Shield, Trash2, MoreHorizontal } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  invitedAt: string;
  lastActive?: string;
}

export function UserManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: 'admin' | 'editor' | 'viewer';
  }>({
    email: '',
    role: 'viewer'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const members = await apiService.get('/api/settings/team-members');
      setTeamMembers(members || []);
    } catch (error) {
      console.error('Failed to load team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide an email address.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      const newMember = await apiService.post('/api/settings/team-members/invite', {
        email: inviteData.email,
        role: inviteData.role
      });
      
      setTeamMembers(prev => [...prev, newMember]);
      setInviteData({ email: '', role: 'viewer' });
      setIsInviteModalOpen(false);
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteData.email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await apiService.delete(`/api/settings/team-members/${userId}`);
      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      
      toast({
        title: "User Removed",
        description: "The team member has been successfully removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await apiService.post(`/api/settings/team-members/${userId}/resend-invite`, {});
      
      toast({
        title: "Invitation Resent",
        description: "The invitation has been resent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'editor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Management</span>
          </CardTitle>
          <CardDescription>
            Manage team members and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Team Members Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Your organization doesn't have any team members yet. Invite colleagues to collaborate on EPR compliance management.
              </p>
              <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite First Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to a colleague to join your EPR compliance team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteData.email}
                        onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value as 'admin' | 'editor' | 'viewer' }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Can view reports and data</SelectItem>
                          <SelectItem value="editor">Editor - Can create and edit content</SelectItem>
                          <SelectItem value="admin">Admin - Full access and management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser} disabled={isInviting}>
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Team Members ({teamMembers.length})</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your team's access and permissions
                  </p>
                </div>
                <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a colleague to join your EPR compliance team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteData.email}
                          onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value as 'admin' | 'editor' | 'viewer' }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer - Can view reports and data</SelectItem>
                            <SelectItem value="editor">Editor - Can create and edit content</SelectItem>
                            <SelectItem value="admin">Admin - Full access and management</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteUser} disabled={isInviting}>
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.lastActive && (
                          <p className="text-xs text-muted-foreground">
                            Last active: {new Date(member.lastActive).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                      {member.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleResendInvite(member.id)}>
                          <Mail className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleRemoveUser(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding what each role can do in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium">Admin</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Full platform access</li>
                  <li>• Manage team members</li>
                  <li>• Configure settings</li>
                  <li>• Export all data</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Editor</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and edit content</li>
                  <li>• Submit reports</li>
                  <li>• Manage products</li>
                  <li>• View analytics</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium">Viewer</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View reports and data</li>
                  <li>• Access analytics</li>
                  <li>• Download reports</li>
                  <li>• Read-only access</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
