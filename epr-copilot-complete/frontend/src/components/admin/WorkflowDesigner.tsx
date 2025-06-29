import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { workflowDesignerService } from '@/services/workflowDesignerService';
import { CustomWorkflow, WorkflowNode } from '@/types/admin';

export const WorkflowDesigner = () => {
  const [workflows, setWorkflows] = useState<CustomWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<CustomWorkflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNodeType, setNewNodeType] = useState<string>('');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = () => {
    setWorkflows(workflowDesignerService.getWorkflows());
  };

  const handleSelectWorkflow = (workflow: CustomWorkflow) => {
    setSelectedWorkflow(workflow);
    setIsEditing(false);
  };

  const handleCreateWorkflow = async () => {
    const newWorkflow = await workflowDesignerService.createWorkflow({
      name: 'New Workflow',
      description: 'A new custom workflow',
      triggerType: 'manual',
      triggerConditions: [],
      nodes: [],
      isActive: false,
      createdBy: 'admin@company.com'
    });

    loadWorkflows();
    setSelectedWorkflow(newWorkflow);
    setIsEditing(true);
  };

  const handleAddNode = async () => {
    if (!selectedWorkflow || !newNodeType) return;

    const nodeTypes = workflowDesignerService.getNodeTypes();
    const nodeType = nodeTypes.find(t => t.value === newNodeType);
    
    if (!nodeType) return;

    await workflowDesignerService.addNode(selectedWorkflow.id, {
      type: newNodeType as any,
      name: `New ${nodeType.label}`,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      config: {},
      connections: []
    });

    const updatedWorkflow = workflowDesignerService.getWorkflow(selectedWorkflow.id);
    if (updatedWorkflow) {
      setSelectedWorkflow(updatedWorkflow);
    }
    setNewNodeType('');
  };

  const handleUpdateNode = async (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!selectedWorkflow) return;

    await workflowDesignerService.updateNode(selectedWorkflow.id, nodeId, updates);
    
    const updatedWorkflow = workflowDesignerService.getWorkflow(selectedWorkflow.id);
    if (updatedWorkflow) {
      setSelectedWorkflow(updatedWorkflow);
    }
  };

  const handleRemoveNode = async (nodeId: string) => {
    if (!selectedWorkflow) return;

    await workflowDesignerService.removeNode(selectedWorkflow.id, nodeId);
    
    const updatedWorkflow = workflowDesignerService.getWorkflow(selectedWorkflow.id);
    if (updatedWorkflow) {
      setSelectedWorkflow(updatedWorkflow);
    }
  };

  const handleValidateWorkflow = () => {
    if (!selectedWorkflow) return;

    const validation = workflowDesignerService.validateWorkflow(selectedWorkflow.id);
    
    if (validation.isValid) {
      alert('Workflow is valid!');
    } else {
      alert(`Workflow validation failed:\n${validation.errors.join('\n')}`);
    }
  };

  const nodeTypes = workflowDesignerService.getNodeTypes();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workflows List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Workflows</CardTitle>
            <Button onClick={handleCreateWorkflow} size="sm">
              Create Workflow
            </Button>
          </div>
          <CardDescription>Design and manage custom workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedWorkflow?.id === workflow.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectWorkflow(workflow)}
              >
                <div className="font-medium">{workflow.name}</div>
                <div className="text-sm text-gray-500">{workflow.description}</div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{workflow.triggerType}</Badge>
                  <span className="text-xs text-gray-400">
                    {workflow.nodes.length} nodes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Designer */}
      {selectedWorkflow && (
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedWorkflow.name}</CardTitle>
                  <CardDescription>{selectedWorkflow.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button variant="outline" onClick={handleValidateWorkflow}>
                    Validate
                  </Button>
                  <Button>Save Workflow</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-6">
                  {/* Add New Node */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add New Node</h4>
                    <div className="flex space-x-2">
                      <Select value={newNodeType} onValueChange={setNewNodeType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodeTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddNode} disabled={!newNodeType}>
                        Add Node
                      </Button>
                    </div>
                  </div>

                  {/* Existing Nodes */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Workflow Nodes</h4>
                    {selectedWorkflow.nodes.map(node => (
                      <div key={node.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Node Name</Label>
                            <Input
                              value={node.name}
                              onChange={(e) => handleUpdateNode(node.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Node Type</Label>
                            <Select
                              value={node.type}
                              onValueChange={(value) => handleUpdateNode(node.id, { type: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {nodeTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {node.type === 'task' && (
                            <>
                              <div>
                                <Label>Assignee Email</Label>
                                <Input
                                  value={node.config.assignee || ''}
                                  onChange={(e) => handleUpdateNode(node.id, { 
                                    config: { ...node.config, assignee: e.target.value }
                                  })}
                                  placeholder="user@company.com"
                                />
                              </div>
                              <div>
                                <Label>Timeout (Days)</Label>
                                <Input
                                  type="number"
                                  value={node.config.timeoutDays || ''}
                                  onChange={(e) => handleUpdateNode(node.id, { 
                                    config: { ...node.config, timeoutDays: parseInt(e.target.value) }
                                  })}
                                />
                              </div>
                            </>
                          )}
                          
                          <div className="flex items-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveNode(node.id)}
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
                /* Workflow Diagram */
                <div className="space-y-4">
                  <h4 className="font-medium">Workflow Diagram</h4>
                  <div className="bg-gray-50 p-6 rounded-lg min-h-96 relative overflow-auto">
                    {selectedWorkflow.nodes.map(node => (
                      <div
                        key={node.id}
                        className="absolute bg-white border rounded-lg p-3 shadow-sm min-w-32"
                        style={{
                          left: `${node.position.x}px`,
                          top: `${node.position.y}px`
                        }}
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {node.type}
                        </div>
                        <div className="font-medium text-sm">{node.name}</div>
                        {node.connections.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            → {node.connections.length} connection(s)
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {selectedWorkflow.nodes.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No nodes added yet. Switch to edit mode to add nodes.
                      </div>
                    )}
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
