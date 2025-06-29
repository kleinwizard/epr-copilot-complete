
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Shield,
  Eye,
  Settings,
  Crown
} from 'lucide-react';
import { getTeamStats } from '@/services/teamService';

export function TeamOverview() {
  const stats = getTeamStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {stats.activeMembers} active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Team members with access
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {Math.round((stats.activeMembers / stats.totalMembers) * 100)}% active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Currently signed in
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          <UserPlus className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.pendingInvitations}</div>
          <div className="mt-2">
            {stats.pendingInvitations > 0 ? (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                Awaiting response
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                No pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Outstanding invitations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
          <Shield className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-3 w-3 text-yellow-600" />
                <span className="text-xs">Admin</span>
              </div>
              <Badge variant="outline">{stats.roles.admin}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-3 w-3 text-blue-600" />
                <span className="text-xs">Manager</span>
              </div>
              <Badge variant="outline">{stats.roles.manager}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-green-600" />
                <span className="text-xs">User</span>
              </div>
              <Badge variant="outline">{stats.roles.user}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-gray-600" />
                <span className="text-xs">Viewer</span>
              </div>
              <Badge variant="outline">{stats.roles.viewer}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
