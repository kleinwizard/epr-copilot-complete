
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Share, Eye, Edit, Users } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface Collaboration {
  id: string;
  reportName: string;
  owner: string;
  status: 'active' | 'pending' | 'completed';
  role: 'owner' | 'editor' | 'viewer';
  lastActivity: string;
  participants: number;
}

interface CollaborativeReportsProps {
  onBack: () => void;
}

export function CollaborativeReports({ onBack }: CollaborativeReportsProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({
    email: '',
    role: 'viewer' as 'owner' | 'editor' | 'viewer',
    reportId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCollaborations();
  }, []);

  const loadCollaborations = async () => {
    try {
      const data = await apiService.get('/api/reports/collaborations');
      setCollaborations(data || []);
    } catch (error) {
      console.error('Failed to load collaborations:', error);
    }
  };

  const handleShareReport = async () => {
    if (!shareData.email || !shareData.role) {
      toast({
        title: "Missing Information",
        description: "Please provide email and select a role.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post('/api/reports/share', shareData);
      
      toast({
        title: "Report Shared",
        description: `Report shared with ${shareData.email} as ${shareData.role}.`,
      });
      
      setShareData({ email: '', role: 'viewer', reportId: '' });
      setIsShareModalOpen(false);
      loadCollaborations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (reportId: string) => {
    window.open(`/reports/${reportId}`, '_blank');
  };

  const handleEditReport = (reportId: string) => {
    window.open(`/reports/${reportId}/edit`, '_blank');
  };

  const handleJoinCollaboration = async (collaborationId: string) => {
    try {
      await apiService.post(`/api/reports/collaborations/${collaborationId}/join`, {});
      
      toast({
        title: "Joined Collaboration",
        description: "You have successfully joined the collaboration.",
      });
      
      loadCollaborations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join collaboration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredCollaborations = collaborations.filter(collab =>
    collab.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'editor': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Collaborative Reports</h2>
            <p className="text-muted-foreground">Manage team collaboration on compliance reports</p>
          </div>
        </div>

        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Share className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Share Report</DialogTitle>
              <DialogDescription>
                Share this report with team members and assign their collaboration role.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="share-email">Email Address</Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareData.email}
                  onChange={(e) => setShareData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Collaboration Role</Label>
                <Select value={shareData.role} onValueChange={(value: 'owner' | 'editor' | 'viewer') => setShareData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner - Full control</SelectItem>
                    <SelectItem value="editor">Editor - Can edit and comment</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareReport} disabled={isLoading}>
                {isLoading ? 'Sharing...' : 'Share Report'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Input
          placeholder="Search collaborations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Collaborations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {collaborations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active collaborations yet. Share a report to get started.
              </div>
            ) : filteredCollaborations.map((collab) => (
              <div key={collab.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{collab.reportName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Owner: {collab.owner} • {collab.participants} participants
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(collab.status)}`}>
                      {collab.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(collab.role)}`}>
                      {collab.role}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Last activity: {collab.lastActivity}
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewReport(collab.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {(collab.role === 'owner' || collab.role === 'editor') && (
                      <Button variant="outline" size="sm" onClick={() => handleEditReport(collab.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {collab.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleJoinCollaboration(collab.id)}>
                        <Users className="h-4 w-4 mr-1" />
                        Join Collaboration
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Collaboration history will be displayed here once you have completed collaborations.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
