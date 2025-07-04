
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  History, 
  GitBranch, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Eye,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

interface ProductVersion {
  id: string;
  version: string;
  changes: string;
  changedBy: string;
  timestamp: string;
  status: 'draft' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  data: any;
}

interface VersionControlProps {
  productId: number;
  currentVersion: any;
  onRevert: (version: ProductVersion) => void;
}


export function VersionControl({ productId, currentVersion, onRevert }: VersionControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<ProductVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ProductVersion | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadVersionHistory = async () => {
    if (!productId) return;
    
    setIsLoading(true);
    try {
      const versionData = await apiService.get(`/api/products/${productId}/versions`);
      setVersions(versionData || []);
    } catch (error) {
      console.error('Failed to load version history:', error);
      setVersions([]);
      toast({
        title: "Error",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    loadVersionHistory();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRevert = (version: ProductVersion) => {
    if (version.status !== 'approved') {
      toast({
        title: "Cannot Revert",
        description: "Only approved versions can be reverted to.",
        variant: "destructive"
      });
      return;
    }

    onRevert(version);
    setIsOpen(false);
    toast({
      title: "Version Reverted",
      description: `Product reverted to version ${version.version}`,
    });
  };

  const handleViewVersion = (version: ProductVersion) => {
    setSelectedVersion(version);
    setShowCompareDialog(true);
  };

  const requestApproval = () => {
    setPendingApproval(true);
    toast({
      title: "Approval Requested",
      description: "Version approval request has been sent to administrators.",
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenDialog}>
        <History className="h-4 w-4 mr-2" />
        Version History
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5" />
              <span>Version History - Product #{productId}</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">Version History</TabsTrigger>
              <TabsTrigger value="approval">Approval Workflow</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">Loading version history...</div>
                </div>
              ) : versions.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">No version history available</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version, index) => (
                  <Card key={version.id} className={`transition-all hover:shadow-md ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(version.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">Version {version.version}</span>
                              {index === 0 && <Badge variant="outline">Current</Badge>}
                              {getStatusBadge(version.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{version.changedBy}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(version.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewVersion(version)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {index !== 0 && version.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRevert(version)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Revert
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm">{version.changes}</p>
                      {version.status === 'approved' && version.approvedBy && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Approved by {version.approvedBy} on {new Date(version.approvalDate!).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approval" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Workflow</CardTitle>
                  <CardDescription>
                    Manage approval requirements for product changes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Pending Changes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current changes require approval before publication.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Approval Comment</label>
                    <Textarea
                      placeholder="Add a comment for the approval request..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={requestApproval} disabled={pendingApproval}>
                      {pendingApproval ? 'Approval Pending...' : 'Request Approval'}
                    </Button>
                    <Button variant="outline">
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4 cursor-pointer" onClick={() => setShowCompareDialog(false)} />
              <span>Version {selectedVersion?.version} Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Changed by:</span>
                  <p>{selectedVersion.changedBy}</p>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <p>{new Date(selectedVersion.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedVersion.status)}</div>
                </div>
                {selectedVersion.approvedBy && (
                  <div>
                    <span className="font-medium">Approved by:</span>
                    <p>{selectedVersion.approvedBy}</p>
                  </div>
                )}
              </div>
              
              <div>
                <span className="font-medium">Changes:</span>
                <p className="text-sm text-muted-foreground mt-1">{selectedVersion.changes}</p>
              </div>

              <div className="flex justify-end space-x-2">
                {selectedVersion.status === 'approved' && (
                  <Button onClick={() => handleRevert(selectedVersion)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Revert to This Version
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
