
import { CustomWorkflow, WorkflowNode, WorkflowConnection } from '../types/admin';

export class WorkflowDesignerService {
  private workflows: Map<string, CustomWorkflow> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockWorkflow: CustomWorkflow = {
      id: 'workflow-1',
      name: 'Document Approval Process',
      description: 'Standard workflow for document review and approval',
      triggerType: 'manual',
      triggerConditions: [
        { field: 'documentStatus', operator: 'equals', value: 'submitted' }
      ],
      nodes: [
        {
          id: 'start-1',
          type: 'start',
          name: 'Document Submitted',
          position: { x: 100, y: 100 },
          config: {},
          connections: [{ targetNodeId: 'task-1' }]
        },
        {
          id: 'task-1',
          type: 'task',
          name: 'Technical Review',
          position: { x: 300, y: 100 },
          config: {
            assignee: 'technical.reviewer@company.com',
            timeoutDays: 3,
            actions: [
              { type: 'notification', config: { template: 'review_required' } }
            ]
          },
          connections: [{ targetNodeId: 'decision-1' }]
        },
        {
          id: 'decision-1',
          type: 'decision',
          name: 'Review Decision',
          position: { x: 500, y: 100 },
          config: {},
          connections: [
            { targetNodeId: 'task-2', condition: { field: 'reviewResult', operator: 'equals', value: 'approved' }, label: 'Approved' },
            { targetNodeId: 'end-1', condition: { field: 'reviewResult', operator: 'equals', value: 'rejected' }, label: 'Rejected' }
          ]
        },
        {
          id: 'task-2',
          type: 'task',
          name: 'Management Approval',
          position: { x: 700, y: 50 },
          config: {
            role: 'manager',
            timeoutDays: 5
          },
          connections: [{ targetNodeId: 'end-2' }]
        },
        {
          id: 'end-1',
          type: 'end',
          name: 'Document Rejected',
          position: { x: 700, y: 150 },
          config: {},
          connections: []
        },
        {
          id: 'end-2',
          type: 'end',
          name: 'Document Approved',
          position: { x: 900, y: 50 },
          config: {},
          connections: []
        }
      ],
      isActive: true,
      createdBy: 'admin@company.com',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z'
    };

    this.workflows.set(mockWorkflow.id, mockWorkflow);
  }

  getWorkflows(): CustomWorkflow[] {
    return Array.from(this.workflows.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getWorkflow(id: string): CustomWorkflow | null {
    return this.workflows.get(id) || null;
  }

  getActiveWorkflows(): CustomWorkflow[] {
    return this.getWorkflows().filter(workflow => workflow.isActive);
  }

  async createWorkflow(workflowData: Omit<CustomWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomWorkflow> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWorkflow: CustomWorkflow = {
      ...workflowData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: string, updates: Partial<CustomWorkflow>): Promise<boolean> {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;

    Object.assign(workflow, updates, { updatedAt: new Date().toISOString() });
    return true;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }

  async addNode(workflowId: string, node: Omit<WorkflowNode, 'id'>): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const newNode: WorkflowNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    workflow.nodes.push(newNode);
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  async updateNode(workflowId: string, nodeId: string, updates: Partial<WorkflowNode>): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const nodeIndex = workflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return false;

    Object.assign(workflow.nodes[nodeIndex], updates);
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  async removeNode(workflowId: string, nodeId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const nodeIndex = workflow.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return false;

    // Remove connections to this node
    workflow.nodes.forEach(node => {
      node.connections = node.connections.filter(conn => conn.targetNodeId !== nodeId);
    });

    workflow.nodes.splice(nodeIndex, 1);
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  async addConnection(workflowId: string, sourceNodeId: string, connection: WorkflowConnection): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return false;

    sourceNode.connections.push(connection);
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  async removeConnection(workflowId: string, sourceNodeId: string, targetNodeId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return false;

    sourceNode.connections = sourceNode.connections.filter(conn => conn.targetNodeId !== targetNodeId);
    workflow.updatedAt = new Date().toISOString();
    return true;
  }

  getNodeTypes(): Array<{ value: string; label: string; description: string; icon: string }> {
    return [
      { value: 'start', label: 'Start', description: 'Workflow starting point', icon: 'Play' },
      { value: 'end', label: 'End', description: 'Workflow ending point', icon: 'Square' },
      { value: 'task', label: 'Task', description: 'Human task requiring action', icon: 'CheckSquare' },
      { value: 'decision', label: 'Decision', description: 'Conditional branch point', icon: 'GitBranch' },
      { value: 'parallel', label: 'Parallel', description: 'Split into parallel paths', icon: 'GitMerge' },
      { value: 'merge', label: 'Merge', description: 'Merge parallel paths', icon: 'GitMerge' },
      { value: 'delay', label: 'Delay', description: 'Wait for specified time', icon: 'Clock' },
      { value: 'notification', label: 'Notification', description: 'Send notification', icon: 'Bell' }
    ];
  }

  validateWorkflow(id: string): { isValid: boolean; errors: string[] } {
    const workflow = this.workflows.get(id);
    if (!workflow) return { isValid: false, errors: ['Workflow not found'] };

    const errors: string[] = [];
    const nodes = workflow.nodes;

    // Check for start node
    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one start node');
    }

    // Check for end node
    const endNodes = nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one end node');
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set<string>();
    nodes.forEach(node => {
      node.connections.forEach(conn => {
        connectedNodeIds.add(conn.targetNodeId);
      });
    });

    const orphanedNodes = nodes.filter(node => 
      node.type !== 'start' && !connectedNodeIds.has(node.id)
    );

    if (orphanedNodes.length > 0) {
      errors.push(`Orphaned nodes detected: ${orphanedNodes.map(n => n.name).join(', ')}`);
    }

    // Check for unreachable end nodes
    const reachableNodes = this.getReachableNodes(workflow);
    const unreachableEndNodes = endNodes.filter(node => !reachableNodes.has(node.id));
    
    if (unreachableEndNodes.length > 0) {
      errors.push(`Unreachable end nodes: ${unreachableEndNodes.map(n => n.name).join(', ')}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private getReachableNodes(workflow: CustomWorkflow): Set<string> {
    const reachable = new Set<string>();
    const startNodes = workflow.nodes.filter(n => n.type === 'start');
    
    const visit = (nodeId: string) => {
      if (reachable.has(nodeId)) return;
      reachable.add(nodeId);
      
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (node) {
        node.connections.forEach(conn => visit(conn.targetNodeId));
      }
    };

    startNodes.forEach(node => visit(node.id));
    return reachable;
  }

  exportWorkflow(id: string): string | null {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;

    return JSON.stringify(workflow, null, 2);
  }

  async importWorkflow(workflowData: string, createdBy: string): Promise<CustomWorkflow | null> {
    try {
      const parsedWorkflow = JSON.parse(workflowData);
      const workflowToImport: Omit<CustomWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
        ...parsedWorkflow,
        createdBy
      };

      return await this.createWorkflow(workflowToImport);
    } catch (error) {
      console.error('Failed to import workflow:', error);
      return null;
    }
  }
}

export const workflowDesignerService = new WorkflowDesignerService();
