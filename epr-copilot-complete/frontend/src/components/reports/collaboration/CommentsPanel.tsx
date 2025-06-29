
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, CheckCircle, Reply, AtSign } from 'lucide-react';
import type { Comment, CollaborationUser } from '@/services/realTimeCollaboration';

interface CommentsPanelProps {
  comments: Comment[];
  users: CollaborationUser[];
  onAddComment: (content: string, mentions: string[]) => void;
  onReplyToComment: (commentId: string, content: string) => void;
  onResolveComment: (commentId: string) => void;
}

export function CommentsPanel({
  comments,
  users,
  onAddComment,
  onReplyToComment,
  onResolveComment
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const mentions = extractMentions(newComment);
      onAddComment(newComment, mentions);
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Comments & Discussion</span>
          <Badge variant="secondary">{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment... Use @username to mention someone"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <AtSign className="h-3 w-3 inline mr-1" />
              Use @ to mention team members
            </div>
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              size="sm"
            >
              Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map(comment => {
            const user = getUserById(comment.userId);
            return (
              <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user?.avatar || user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {comment.resolved && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {!comment.resolved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveComment(comment.id)}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm">{comment.content}</p>

                {comment.field && (
                  <Badge variant="outline" className="text-xs">
                    Field: {comment.field}
                  </Badge>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                    {comment.replies.map(reply => {
                      const replyUser = getUserById(reply.userId);
                      return (
                        <div key={reply.id} className="flex items-start space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {replyUser?.avatar || replyUser?.name.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-xs font-medium">{replyUser?.name || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">{formatTimestamp(reply.timestamp)}</p>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="h-6 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet</p>
              <p className="text-xs">Start a discussion about this report</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
