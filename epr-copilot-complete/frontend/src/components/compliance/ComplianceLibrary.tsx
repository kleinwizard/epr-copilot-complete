
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Book, 
  Search, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2,
  Clock,
  FileText,
  Building,
  Scale
} from 'lucide-react';
import { 
  complianceLibraryService, 
  ComplianceRequirement, 
  ComplianceChecklist 
} from '@/services/complianceLibraryService';

export function ComplianceLibrary() {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>(
    complianceLibraryService.getRequirements()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [checklist, setChecklist] = useState<ComplianceChecklist | null>(null);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setRequirements(complianceLibraryService.searchRequirements(searchTerm));
    } else {
      setRequirements(complianceLibraryService.getRequirements());
    }
  };

  const createChecklist = (requirementId: string) => {
    const newChecklist = complianceLibraryService.createChecklist(requirementId);
    setChecklist(newChecklist);
  };

  const updateChecklistItem = (itemId: string, completed: boolean) => {
    if (!checklist) return;
    
    complianceLibraryService.updateChecklistItem(
      checklist.id, 
      itemId, 
      { 
        completed,
        completedBy: completed ? 'current.user@company.com' : undefined
      }
    );
    
    // Refresh checklist
    const updatedChecklist = complianceLibraryService.getChecklist(checklist.id);
    if (updatedChecklist) {
      setChecklist(updatedChecklist);
    }
  };

  const getPriorityColor = (priority: ComplianceRequirement['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingDeadlines = complianceLibraryService.getUpcomingDeadlines();
  const complianceScore = complianceLibraryService.getComplianceScore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Library</h1>
          <p className="text-muted-foreground">Track regulatory requirements and compliance</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Compliance Score</p>
            <div className="flex items-center gap-2">
              <Progress value={complianceScore} className="w-24" />
              <span className="font-semibold">{complianceScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {upcomingDeadlines.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Upcoming Deadlines ({upcomingDeadlines.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 3).map(deadline => (
                <div key={deadline.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{deadline.title}</p>
                    <p className="text-sm text-muted-foreground">{deadline.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-orange-800">
                      {new Date(deadline.date).toLocaleDateString()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">{deadline.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Requirements</CardTitle>
              <CardDescription>Browse and search compliance requirements</CardDescription>
              <div className="flex gap-2">
                <Input
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map(req => (
                  <div 
                    key={req.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRequirement?.id === req.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedRequirement(req)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{req.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(req.priority)}>
                          {req.priority}
                        </Badge>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {req.jurisdiction}
                      </span>
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        {req.authority}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Effective {new Date(req.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedRequirement ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedRequirement.title}</CardTitle>
                <CardDescription>{selectedRequirement.jurisdiction}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Requirements ({selectedRequirement.requirements.length})</h4>
                  <div className="space-y-2">
                    {selectedRequirement.requirements.map(req => (
                      <div key={req.id} className="text-sm border-l-2 border-blue-200 pl-3">
                        <p className="font-medium">{req.section}: {req.requirement}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {req.compliance}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {req.frequency}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequirement.deadlines.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Deadlines</h4>
                    <div className="space-y-2">
                      {selectedRequirement.deadlines.map(deadline => (
                        <div key={deadline.id} className="text-sm">
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-muted-foreground">{new Date(deadline.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequirement.penalties.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Penalties</h4>
                    <div className="space-y-2">
                      {selectedRequirement.penalties.map((penalty, index) => (
                        <div key={index} className="text-sm border-l-2 border-red-200 pl-3">
                          <p className="font-medium capitalize">{penalty.type}</p>
                          <p className="text-muted-foreground">{penalty.description}</p>
                          {penalty.amount && (
                            <p className="text-red-600 font-medium">
                              {penalty.currency} {penalty.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => createChecklist(selectedRequirement.id)}
                  className="w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Compliance Checklist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a requirement to view details</p>
                </div>
              </CardContent>
            </Card>
          )}

          {checklist && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Compliance Checklist</CardTitle>
                <CardDescription>
                  Status: <Badge className={checklist.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {checklist.status.replace('_', ' ')}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.items.map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => updateChecklistItem(item.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.description}
                        </p>
                        {item.completedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Progress 
                    value={(checklist.items.filter(i => i.completed).length / checklist.items.length) * 100} 
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {checklist.items.filter(i => i.completed).length} of {checklist.items.length} completed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
