
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Share } from 'lucide-react';
import { CollaborationCard } from './collaboration/CollaborationCard';
import { CollaborationHistory } from './collaboration/CollaborationHistory';
import { PermissionManagement } from './collaboration/PermissionManagement';
import { CollaborationSearch } from './collaboration/CollaborationSearch';
import { mockCollaborations, getStatusColor, getRoleColor } from './collaboration/CollaborationUtils';

interface CollaborativeReportsProps {
  onBack: () => void;
}

export function CollaborativeReports({ onBack }: CollaborativeReportsProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCollaborations = mockCollaborations.filter(collab =>
    collab.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collab.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Collaborative Reports</h2>
            <p className="text-muted-foreground">Manage team collaboration on compliance reports</p>
          </div>
        </div>

        <Button>
          <Share className="h-4 w-4 mr-2" />
          Share Report
        </Button>
      </div>

      <CollaborationSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Collaborations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredCollaborations.map((collab) => (
              <CollaborationCard
                key={collab.id}
                collaboration={collab}
                getStatusColor={getStatusColor}
                getRoleColor={getRoleColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <CollaborationHistory />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
