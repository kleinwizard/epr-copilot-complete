
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Eye,
  Edit,
  GitBranch,
  FileText
} from 'lucide-react';

interface Collaborator {
  name: string;
  avatar: string;
  role: string;
  lastActive: string;
}

interface CollaborationItem {
  id: string;
  reportId: string;
  reportName: string;
  status: string;
  owner: string;
  collaborators: Collaborator[];
  comments: number;
  changes: number;
  lastModified: string;
}

interface CollaborationCardProps {
  collaboration: CollaborationItem;
  getStatusColor: (status: string) => string;
  getRoleColor: (role: string) => string;
}

export function CollaborationCard({ 
  collaboration, 
  getStatusColor, 
  getRoleColor 
}: CollaborationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>{collaboration.reportName}</span>
              <Badge className={getStatusColor(collaboration.status)}>
                {collaboration.status}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Owned by {collaboration.owner} • Last modified {new Date(collaboration.lastModified).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{collaboration.collaborators.length} collaborators</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{collaboration.comments} comments</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitBranch className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{collaboration.changes} changes</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Collaborators</h4>
            <div className="flex flex-wrap gap-2">
              {collaboration.collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{collaborator.name}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className={`text-xs ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </Badge>
                      <span className="text-xs text-gray-500">•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{collaborator.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-gray-500">
              Real-time collaboration enabled
            </div>
            <Button size="sm">
              Join Collaboration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
