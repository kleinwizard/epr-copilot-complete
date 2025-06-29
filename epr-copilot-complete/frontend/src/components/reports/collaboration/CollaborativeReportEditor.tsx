
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, MessageSquare, GitBranch, Wifi, WifiOff } from 'lucide-react';
import { RealtimeUsers } from './RealtimeUsers';
import { CommentsPanel } from './CommentsPanel';
import { VersionControl } from './VersionControl';
import {
  mockActiveUsers,
  mockComments,
  subscribeToRealtimeEdits,
  createComment,
  createVersionSnapshot,
  type CollaborationUser,
  type Comment,
  type RealtimeEdit,
  type VersionSnapshot
} from '@/services/realTimeCollaboration';

interface CollaborativeReportEditorProps {
  reportId: string;
  onClose: () => void;
}

export function CollaborativeReportEditor({ reportId, onClose }: CollaborativeReportEditorProps) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>(mockActiveUsers);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [pendingEdits, setPendingEdits] = useState<RealtimeEdit[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [conflictCount, setConflictCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeEdits(reportId, (edit) => {
      setPendingEdits(prev => [...prev, edit]);
      
      if (edit.status === 'conflict') {
        setConflictCount(prev => prev + 1);
      }
    });

    // Simulate connection status changes
    const connectionInterval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : prev);
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(connectionInterval);
    };
  }, [reportId]);

  const handleAddComment = async (content: string, mentions: string[]) => {
    const newComment = await createComment(reportId, 'general', content, undefined, mentions);
    setComments(prev => [newComment, ...prev]);
  };

  const handleReplyToComment = async (commentId: string, content: string) => {
    // In a real implementation, this would update the specific comment
    console.log('Replying to comment:', commentId, content);
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, resolved: true }
          : comment
      )
    );
  };

  const handleCreateSnapshot = async (description: string) => {
    const snapshot = await createVersionSnapshot(reportId, description, pendingEdits);
    setVersions(prev => [snapshot, ...prev]);
    setPendingEdits([]);
  };

  const handleRestoreVersion = (versionId: string) => {
    console.log('Restoring version:', versionId);
    // In a real implementation, this would restore the report to the selected version
  };

  const handleDownloadVersion = (versionId: string) => {
    console.log('Downloading version:', versionId);
    // In a real implementation, this would download the specific version
  };

  const activeTab = 'collaboration';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Collaborative Report Editor</h2>
            <Badge variant="outline">{reportId}</Badge>
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Reconnecting...</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <RealtimeUsers users={activeUsers} currentUserId="current-user" />
            
            {conflictCount > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{conflictCount} conflicts</span>
              </Badge>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Main Editor Area */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Report Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium mb-2">Live Editing Features</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Real-time cursor positions</li>
                        <li>• Conflict-free collaborative editing</li>
                        <li>• Auto-save every 30 seconds</li>
                        <li>• Undo/redo with conflict resolution</li>
                      </ul>
                    </div>

                    {pendingEdits.length > 0 && (
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900 mb-2">Pending Changes</h4>
                        <div className="space-y-1">
                          {pendingEdits.slice(0, 3).map(edit => (
                            <div key={edit.id} className="text-sm text-blue-700">
                              {edit.userId} updated {edit.field}: {edit.oldValue} → {edit.newValue}
                            </div>
                          ))}
                          {pendingEdits.length > 3 && (
                            <div className="text-sm text-blue-600">
                              +{pendingEdits.length - 3} more changes
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collaboration Sidebar */}
            <div className="space-y-4">
              <Tabs value={activeTab} className="h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="collaboration" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="versions" className="text-xs">
                    <GitBranch className="h-3 w-3 mr-1" />
                    Versions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="collaboration" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Active Collaborators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activeUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                            <div className="relative">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                                {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {user.isOnline && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.currentLocation 
                                  ? `Editing ${user.currentLocation.section}`
                                  : 'Online'
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="comments" className="mt-4 h-full">
                  <CommentsPanel
                    comments={comments}
                    users={activeUsers}
                    onAddComment={handleAddComment}
                    onReplyToComment={handleReplyToComment}
                    onResolveComment={handleResolveComment}
                  />
                </TabsContent>
                
                <TabsContent value="versions" className="mt-4 h-full">
                  <VersionControl
                    versions={versions}
                    users={activeUsers}
                    currentVersion="v2.1"
                    onCreateSnapshot={handleCreateSnapshot}
                    onRestoreVersion={handleRestoreVersion}
                    onDownloadVersion={handleDownloadVersion}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
