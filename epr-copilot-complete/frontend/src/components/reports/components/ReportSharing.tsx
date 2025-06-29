
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Globe, Lock, Eye, Edit, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharingPermission {
  id: string;
  email: string;
  role: 'viewer' | 'editor';
  createdAt: string;
}

interface ReportSharingProps {
  reportId: string;
  isPublic: boolean;
  permissions: SharingPermission[];
  onTogglePublic: (isPublic: boolean) => void;
  onAddPermission: (email: string, role: string) => void;
  onRemovePermission: (permissionId: string) => void;
}

export function ReportSharing({
  reportId,
  isPublic,
  permissions,
  onTogglePublic,
  onAddPermission,
  onRemovePermission
}: ReportSharingProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/reports/${reportId}/share`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const getRoleIcon = (role: string) => {
    return role === 'editor' ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'editor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>Share Report</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Public Sharing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Public Access</span>
              </Label>
              <p className="text-sm text-gray-600">Anyone with the link can view this report</p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={onTogglePublic}
            />
          </div>

          {isPublic && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-2">
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly className="text-sm" />
                <Button size="sm" onClick={copyShareLink}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-blue-700">
                This report is publicly accessible. Anyone with this link can view it.
              </p>
            </div>
          )}
        </div>

        {/* Direct Sharing */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Invite People</span>
          </Label>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                onAddPermission(newEmail, newRole);
                setNewEmail('');
              }}
              disabled={!newEmail}
            >
              Invite
            </Button>
          </div>
        </div>

        {/* Current Permissions */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Current Access ({permissions.length})</span>
          </Label>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{permission.email}</span>
                  <Badge className={`text-xs ${getRoleColor(permission.role)}`}>
                    {getRoleIcon(permission.role)}
                    <span className="ml-1">{permission.role}</span>
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemovePermission(permission.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            {permissions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No direct permissions set. Use the form above to invite people.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
