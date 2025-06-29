
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare, History, Share2, Plus } from 'lucide-react';
import type { ReportCollaborator, ReportComment, ReportVersion, ReportActivity } from '../types/collaboration';

interface CollaborationPanelProps {
  collaborators: ReportCollaborator[];
  comments: ReportComment[];
  versions: ReportVersion[];
  activities: ReportActivity[];
  onInviteCollaborator: (email: string, role: string) => void;
  onAddComment: (content: string, section?: string) => void;
  onResolveComment: (commentId: string) => void;
}

export function CollaborationPanel({
  collaborators,
  comments,
  versions,
  activities,
  onInviteCollaborator,
  onAddComment,
  onResolveComment
}: CollaborationPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Collaboration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="collaborators" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collaborators">Team</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="collaborators" className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter email to invite"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={() => {
                  onInviteCollaborator(inviteEmail, 'editor');
                  setInviteEmail('');
                }}
                disabled={!inviteEmail}
              >
                <Plus className="h-3 w-3 mr-1" />
                Invite
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{collaborator.name}</p>
                        <p className="text-xs text-gray-600">{collaborator.email}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
              />
              <Button 
                size="sm"
                onClick={() => {
                  onAddComment(newComment);
                  setNewComment('');
                }}
                disabled={!newComment.trim()}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Comment
              </Button>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className={`p-3 border rounded ${comment.resolved ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">{comment.createdAt}</span>
                      </div>
                      {!comment.resolved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onResolveComment(comment.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    {comment.resolved && (
                      <Badge variant="outline" className="text-xs mt-1">Resolved</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {versions.map(version => (
                  <div key={version.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={version.isCurrent ? "default" : "outline"}>
                          v{version.version}
                        </Badge>
                        <span className="font-medium">{version.title}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <History className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      By {version.author.name} • {version.createdAt}
                    </p>
                    <div className="space-y-1">
                      {version.changes.map((change, index) => (
                        <p key={index} className="text-xs text-gray-500">• {change}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {activities.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 p-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{activity.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
