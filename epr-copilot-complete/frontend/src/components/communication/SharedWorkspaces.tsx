
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, FileText, Calendar, Plus, Lock } from 'lucide-react';
import { workspaceService } from '@/services/workspaceService';
import { Workspace } from '@/types/communication';

export const SharedWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = () => {
    const workspaceData = workspaceService.getWorkspaces();
    setWorkspaces(workspaceData);
  };

  const getWorkspaceTypeColor = (type: Workspace['type']) => {
    switch (type) {
      case 'compliance':
        return 'bg-blue-100 text-blue-800';
      case 'project':
        return 'bg-green-100 text-green-800';
      case 'vendor':
        return 'bg-purple-100 text-purple-800';
      case 'department':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Workspaces</h2>
          <p className="text-gray-600">Collaborate with your team and external partners</p>
        </div>
        <Button onClick={async () => {
          try {
            const workspaceName = prompt('Enter workspace name:');
            if (!workspaceName) return;
            
            const workspaceDescription = prompt('Enter workspace description (optional):') || '';
            const workspaceType = prompt('Enter workspace type (compliance/project/vendor/department):') || 'project';
            const isPrivate = confirm('Make this workspace private?');
            
            const newWorkspace = await workspaceService.createWorkspace({
              name: workspaceName,
              description: workspaceDescription,
              type: workspaceType as any,
              isPrivate,
              members: [{
                userId: 'current-user',
                userName: 'Current User',
                role: 'admin',
                permissions: ['read', 'write', 'admin'],
                joinedAt: new Date().toISOString()
              }],
              channels: [],
              documents: [],
              tags: [],
              createdBy: 'current-user'
            });
            
            if (newWorkspace) {
              loadWorkspaces();
            }
          } catch (error) {
            console.error('Failed to create workspace:', error);
            alert('Failed to create workspace. Please try again.');
          }
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    {workspace.isPrivate && (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {workspace.description}
                  </p>
                </div>
                <Badge className={getWorkspaceTypeColor(workspace.type)}>
                  {workspace.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Workspace Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold">{workspace.members.length}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold">{workspace.documents.length}</div>
                  <div className="text-xs text-gray-500">Documents</div>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold">{formatDate(workspace.createdAt)}</div>
                  <div className="text-xs text-gray-500">Created</div>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="text-sm font-medium mb-2">Members</div>
                <div className="flex -space-x-2">
                  {workspace.members.slice(0, 5).map((member, index) => (
                    <Avatar key={member.userId} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback className="text-xs">
                        {member.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {workspace.members.length > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        +{workspace.members.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {workspace.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {workspace.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {workspace.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workspace.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  Open Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
