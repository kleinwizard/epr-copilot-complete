import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { reportDesignerService } from '@/services/reportDesignerService';
import { CustomReport, ReportComponent } from '@/types/admin';

export const ReportDesigner = () => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComponentType, setNewComponentType] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(reportDesignerService.getReports());
  };

  const handleSelectReport = (report: CustomReport) => {
    setSelectedReport(report);
    setIsEditing(false);
  };

  const handleCreateReport = async () => {
    const newReport = await reportDesignerService.createReport({
      name: 'New Report',
      description: 'A new custom report',
      category: 'general',
      components: [],
      layout: 'grid',
      isPublic: false,
      createdBy: 'admin@company.com',
      tags: []
    });

    loadReports();
    setSelectedReport(newReport);
    setIsEditing(true);
  };

  const handleAddComponent = async () => {
    if (!selectedReport || !newComponentType) return;

    const componentTypes = reportDesignerService.getComponentTypes();
    const componentType = componentTypes.find(t => t.value === newComponentType);
    
    if (!componentType) return;

    await reportDesignerService.addComponent(selectedReport.id, {
      name: `New ${componentType.label}`,
      type: newComponentType as any,
      position: { x: 0, y: 0, width: 4, height: 3 },
      config: {}
    });

    const updatedReport = reportDesignerService.getReport(selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
    setNewComponentType('');
  };

  const handleUpdateComponent = async (componentId: string, updates: Partial<ReportComponent>) => {
    if (!selectedReport) return;

    await reportDesignerService.updateComponent(selectedReport.id, componentId, updates);
    
    const updatedReport = reportDesignerService.getReport(selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
  };

  const handleRemoveComponent = async (componentId: string) => {
    if (!selectedReport) return;

    await reportDesignerService.removeComponent(selectedReport.id, componentId);
    
    const updatedReport = reportDesignerService.getReport(selectedReport.id);
    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
  };

  const componentTypes = reportDesignerService.getComponentTypes();
  const dataSources = reportDesignerService.getDataSources();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reports List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Reports</CardTitle>
            <Button onClick={handleCreateReport} size="sm">
              Create Report
            </Button>
          </div>
          <CardDescription>Design custom reports and dashboards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.map(report => (
              <div
                key={report.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedReport?.id === report.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectReport(report)}
              >
                <div className="font-medium">{report.name}</div>
                <div className="text-sm text-gray-500">{report.description}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">{report.category}</Badge>
                  <Badge variant={report.isPublic ? 'default' : 'secondary'}>
                    {report.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {report.components.length} components
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Designer */}
      {selectedReport && (
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedReport.name}</CardTitle>
                  <CardDescription>{selectedReport.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button>Save Report</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  {/* Add New Component */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add New Component</h4>
                    <div className="flex space-x-2">
                      <Select value={newComponentType} onValueChange={setNewComponentType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select component type" />
                        </SelectTrigger>
                        <SelectContent>
                          {componentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddComponent} disabled={!newComponentType}>
                        Add Component
                      </Button>
                    </div>
                  </div>

                  {/* Existing Components */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Report Components</h4>
                    {selectedReport.components.map(component => (
                      <div key={component.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Component Name</Label>
                            <Input
                              value={component.name}
                              onChange={(e) => handleUpdateComponent(component.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Component Type</Label>
                            <Select
                              value={component.type}
                              onValueChange={(value) => handleUpdateComponent(component.id, { type: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {componentTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Data Source</Label>
                            <Select
                              value={component.dataSource || ''}
                              onValueChange={(value) => handleUpdateComponent(component.id, { dataSource: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select data source" />
                              </SelectTrigger>
                              <SelectContent>
                                {dataSources.map(source => (
                                  <SelectItem key={source.value} value={source.value}>
                                    {source.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveComponent(component.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Report Preview */
                <div className="space-y-4">
                  <h4 className="font-medium">Report Preview</h4>
                  <div className="grid grid-cols-12 gap-4 min-h-96 bg-gray-50 p-4 rounded-lg">
                    {selectedReport.components.map(component => (
                      <div
                        key={component.id}
                        className="bg-white border rounded-lg p-4 shadow-sm"
                        style={{
                          gridColumn: `span ${component.position.width}`,
                          gridRow: `span ${component.position.height}`,
                          minHeight: `${component.position.height * 60}px`
                        }}
                      >
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {component.type.toUpperCase()}
                        </div>
                        <div className="font-medium">{component.name}</div>
                        
                        {component.type === 'metric' && (
                          <div className="mt-4">
                            <div className="text-2xl font-bold text-blue-600">1,234</div>
                            <div className="text-sm text-gray-500">Sample Value</div>
                          </div>
                        )}
                        
                        {component.type === 'chart' && (
                          <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-gray-500">Chart Placeholder</span>
                          </div>
                        )}
                        
                        {component.type === 'table' && (
                          <div className="mt-4">
                            <div className="border rounded">
                              <div className="bg-gray-50 p-2 border-b text-sm font-medium">
                                Sample Table
                              </div>
                              <div className="p-2 text-sm text-gray-600">
                                Table data would appear here
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
