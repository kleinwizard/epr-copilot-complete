
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Clock } from 'lucide-react';
import type { CollaborationUser } from '@/services/realTimeCollaboration';

interface RealtimeUsersProps {
  users: CollaborationUser[];
  currentUserId?: string;
}

export function RealtimeUsers({ users, currentUserId }: RealtimeUsersProps) {
  const activeUsers = users.filter(user => user.isOnline && user.id !== currentUserId);
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map(user => (
          <Tooltip key={user.id}>
            <TooltipTrigger>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-white">
                  <AvatarFallback className="text-xs">
                    {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{user.name}</p>
                <div className="flex items-center space-x-1 text-xs">
                  <Eye className="h-3 w-3" />
                  <span>
                    {user.currentLocation 
                      ? `Viewing ${user.currentLocation.section}`
                      : 'Online'
                    }
                  </span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {activeUsers.length > 3 && (
          <div className="flex items-center justify-center h-8 w-8 bg-gray-100 border-2 border-white rounded-full text-xs font-medium">
            +{activeUsers.length - 3}
          </div>
        )}
      </div>
      
      {activeUsers.length > 0 && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {activeUsers.length} active
        </Badge>
      )}
    </div>
  );
}
