
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Users, UserPlus, Mail, Phone, Shield, MoreVertical, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  mfaEnabled: boolean;
  avatar?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'admin',
      department: 'Compliance',
      status: 'active',
      lastLogin: '2024-01-20',
      mfaEnabled: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'manager',
      department: 'Operations',
      status: 'active',
      lastLogin: '2024-01-19',
      mfaEnabled: false,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'user',
      department: 'Production',
      status: 'inactive',
      lastLogin: '2024-01-10',
      mfaEnabled: true,
    },
  ]);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [bulkInviteEmails, setBulkInviteEmails] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as const,
    department: ''
  });
  const { toast } = useToast();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'locked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInviteUser = async () => {
    try {
      // Mock API call to invite user
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newId = (users.length + 1).toString();
      const user: User = {
        ...newUser,
        id: newId,
        status: 'active',
        lastLogin: 'Never',
        mfaEnabled: false
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'user', department: '' });
      setShowInviteDialog(false);
      toast({
        title: "User invited",
        description: `Invitation sent to ${newUser.email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    }
  };

  const handleBulkInvite = async () => {
    try {
      const emails = bulkInviteEmails.split('\n').filter(email => email.trim());
      // Mock API call for bulk invite
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBulkInviteEmails('');
      toast({
        title: "Bulk invitations sent",
        description: `Invitations sent to ${emails.length} users`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send bulk invitations",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User deleted",
      description: "User has been removed from the system",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage team members and their access permissions
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-email">Email Address</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="user-department">Department</Label>
                    <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bulk-emails">Bulk Invite (Optional)</Label>
                  <textarea
                    id="bulk-emails"
                    className="w-full h-20 p-2 border rounded-md"
                    placeholder="Enter email addresses, one per line&#10;user1@company.com&#10;user2@company.com"
                    value={bulkInviteEmails}
                    onChange={(e) => setBulkInviteEmails(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For bulk invites, users will be assigned the selected role and department
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                {bulkInviteEmails && (
                  <Button variant="outline" onClick={handleBulkInvite}>
                    Send Bulk Invites
                  </Button>
                )}
                <Button onClick={handleInviteUser} disabled={!newUser.name || !newUser.email}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Members</span>
          </CardTitle>
          <CardDescription>
            All users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Department: {user.department}</span>
                      <span>•</span>
                      <span>Last login: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.mfaEnabled && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Shield className="h-3 w-3 mr-1" />
                        MFA
                      </Badge>
                    )}
                    
                    <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(user.id)}>
                      {user.status === 'active' ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm" onClick={() => deleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
