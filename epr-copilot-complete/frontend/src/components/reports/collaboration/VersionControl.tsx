
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GitBranch, Save, History, RotateCcw, Download } from 'lucide-react';
import type { VersionSnapshot, CollaborationUser } from '@/services/realTimeCollaboration';

interface VersionControlProps {
  versions: VersionSnapshot[];
  users: CollaborationUser[];
  currentVersion: string;
  onCreateSnapshot: (description: string) => void;
  onRestoreVersion: (versionId: string) => void;
  onDownloadVersion: (versionId: string) => void;
}

export function VersionControl({
  versions,
  users,
  currentVersion,
  onCreateSnapshot,
  onRestoreVersion,
  onDownloadVersion
}: VersionControlProps) {
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  const handleCreateSnapshot = async () => {
    if (snapshotDescription.trim()) {
      setIsCreatingSnapshot(true);
      await onCreateSnapshot(snapshotDescription);
      setSnapshotDescription('');
      setIsCreatingSnapshot(false);
    }
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
          <GitBranch className="h-5 w-5" />
          <span>Version Control</span>
          <Badge variant="outline">{currentVersion}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Snapshot */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Create Snapshot</h4>
          <Input
            placeholder="Describe this version (e.g., 'Added Q2 product data')"
            value={snapshotDescription}
            onChange={(e) => setSnapshotDescription(e.target.value)}
          />
          <Button
            onClick={handleCreateSnapshot}
            disabled={!snapshotDescription.trim() || isCreatingSnapshot}
            size="sm"
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}
          </Button>
        </div>

        {/* Version History */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <History className="h-4 w-4 mr-2" />
            Version History
          </h4>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {versions.map(version => {
              const user = getUserById(version.createdBy);
              const isCurrent = version.version === currentVersion;
              
              return (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 space-y-2 ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={isCurrent ? 'default' : 'outline'} className="text-xs">
                        {version.version}
                      </Badge>
                      {version.isAutoSave && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-save
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestoreVersion(version.id)}
                          className="h-6 w-6 p-0"
                          title="Restore this version"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadVersion(version.id)}
                        className="h-6 w-6 p-0"
                        title="Download this version"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm font-medium">{version.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {user?.avatar || user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user?.name || 'Unknown User'}</span>
                    </div>
                    <span>{formatTimestamp(version.timestamp)}</span>
                  </div>

                  {version.changes.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{version.changes.length} changes:</span>
                      <span className="ml-1">
                        {version.changes.slice(0, 2).map(change => change.field).join(', ')}
                        {version.changes.length > 2 && ` +${version.changes.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {versions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No versions saved yet</p>
                <p className="text-xs">Create your first snapshot above</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
