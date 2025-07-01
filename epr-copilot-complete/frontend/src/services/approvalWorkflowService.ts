
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'review' | 'notification' | 'conditional';
  order: number;
  assignedTo: string[];
  assignedRoles: string[];
  requiresAllApprovers: boolean;
  timeoutDays?: number;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface WorkflowAction {
  type: 'email' | 'notification' | 'status_change' | 'assignment';
  parameters: Record<string, any>;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  entityType: 'document' | 'product' | 'material' | 'fee' | 'report';
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'status_change' | 'field_change' | 'scheduled' | 'manual';
  conditions: WorkflowCondition[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityType: string;
  entityId: string;
  entityName: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  currentStepId?: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  steps: WorkflowStepInstance[];
  metadata: Record<string, any>;
}

export interface WorkflowStepInstance {
  id: string;
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rejected';
  assignedTo: string[];
  approvals: ApprovalDecision[];
  startedAt?: string;
  completedAt?: string;
  timeoutAt?: string;
}

export interface ApprovalDecision {
  userId: string;
  userEmail: string;
  decision: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  timestamp: string;
}

export interface ApprovalTask {
  id: string;
  workflowInstanceId: string;
  stepInstanceId: string;
  assignedTo: string;
  entityType: string;
  entityId: string;
  entityName: string;
  stepName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

export class ApprovalWorkflowService {
  private workflows: Map<string, ApprovalWorkflow> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private tasks: Map<string, ApprovalTask> = new Map();

  constructor() {
    this.loadRealData();
  }

  private loadRealData() {
    const storedWorkflows = localStorage.getItem('approval_workflows');
    const storedInstances = localStorage.getItem('workflow_instances');
    const storedTasks = localStorage.getItem('approval_tasks');

    if (storedWorkflows) {
      try {
        const workflows = JSON.parse(storedWorkflows);
        workflows.forEach((workflow: ApprovalWorkflow) => this.workflows.set(workflow.id, workflow));
      } catch (error) {
        console.error('Failed to load workflows from storage:', error);
      }
    }

    if (storedInstances) {
      try {
        const instances = JSON.parse(storedInstances);
        instances.forEach((instance: WorkflowInstance) => this.instances.set(instance.id, instance));
      } catch (error) {
        console.error('Failed to load workflow instances from storage:', error);
      }
    }

    if (storedTasks) {
      try {
        const tasks = JSON.parse(storedTasks);
        tasks.forEach((task: ApprovalTask) => this.tasks.set(task.id, task));
      } catch (error) {
        console.error('Failed to load approval tasks from storage:', error);
      }
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('approval_workflows', JSON.stringify(Array.from(this.workflows.values())));
      localStorage.setItem('workflow_instances', JSON.stringify(Array.from(this.instances.values())));
      localStorage.setItem('approval_tasks', JSON.stringify(Array.from(this.tasks.values())));
    } catch (error) {
      console.error('Failed to save workflow data to storage:', error);
    }
  }

  createWorkflow(workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>): ApprovalWorkflow {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(id, newWorkflow);
    this.saveToStorage();
    return newWorkflow;
  }

  startWorkflow(
    workflowId: string,
    entityType: string,
    entityId: string,
    entityName: string,
    startedBy: string,
    metadata: Record<string, any> = {}
  ): WorkflowInstance {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      entityType,
      entityId,
      entityName,
      status: 'active',
      startedBy,
      startedAt: new Date().toISOString(),
      steps: workflow.steps.map(step => ({
        id: `step_instance_${step.id}_${Date.now()}`,
        stepId: step.id,
        status: 'pending',
        assignedTo: step.assignedTo,
        approvals: []
      })),
      metadata
    };

    // Start first step
    if (instance.steps.length > 0) {
      instance.currentStepId = instance.steps[0].id;
      instance.steps[0].status = 'in_progress';
      instance.steps[0].startedAt = new Date().toISOString();

      // Create approval tasks
      this.createApprovalTasks(instance, instance.steps[0]);
    }

    this.instances.set(instanceId, instance);
    return instance;
  }

  private createApprovalTasks(instance: WorkflowInstance, stepInstance: WorkflowStepInstance) {
    const workflow = this.workflows.get(instance.workflowId);
    const step = workflow?.steps.find(s => s.id === stepInstance.stepId);
    
    if (!step) return;

    stepInstance.assignedTo.forEach(assignee => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const task: ApprovalTask = {
        id: taskId,
        workflowInstanceId: instance.id,
        stepInstanceId: stepInstance.id,
        assignedTo: assignee,
        entityType: instance.entityType,
        entityId: instance.entityId,
        entityName: instance.entityName,
        stepName: step.name,
        priority: 'medium',
        dueDate: step.timeoutDays ? 
          new Date(Date.now() + step.timeoutDays * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.tasks.set(taskId, task);
    });
  }

  submitDecision(
    instanceId: string,
    stepInstanceId: string,
    userId: string,
    userEmail: string,
    decision: ApprovalDecision['decision'],
    comments?: string
  ): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== 'active') return false;

    const stepInstance = instance.steps.find(s => s.id === stepInstanceId);
    if (!stepInstance || stepInstance.status !== 'in_progress') return false;

    const workflow = this.workflows.get(instance.workflowId);
    const step = workflow?.steps.find(s => s.id === stepInstance.stepId);
    if (!step) return false;

    // Add approval decision
    const approvalDecision: ApprovalDecision = {
      userId,
      userEmail,
      decision,
      comments,
      timestamp: new Date().toISOString()
    };

    stepInstance.approvals.push(approvalDecision);

    // Update task status
    const task = Array.from(this.tasks.values()).find(t => 
      t.workflowInstanceId === instanceId && 
      t.stepInstanceId === stepInstanceId && 
      t.assignedTo === userEmail
    );
    if (task) {
      task.status = 'completed';
    }

    // Check if step is complete
    const hasRejection = stepInstance.approvals.some(a => a.decision === 'reject');
    const hasAllApprovals = step.requiresAllApprovers ? 
      step.assignedTo.every(assignee => 
        stepInstance.approvals.some(a => a.userEmail === assignee && a.decision === 'approve')
      ) :
      stepInstance.approvals.some(a => a.decision === 'approve');

    if (hasRejection) {
      stepInstance.status = 'rejected';
      stepInstance.completedAt = new Date().toISOString();
      instance.status = 'cancelled';
      instance.completedAt = new Date().toISOString();
    } else if (hasAllApprovals) {
      stepInstance.status = 'completed';
      stepInstance.completedAt = new Date().toISOString();
      
      // Move to next step or complete workflow
      this.advanceWorkflow(instance);
    }

    return true;
  }

  private advanceWorkflow(instance: WorkflowInstance) {
    const currentStepIndex = instance.steps.findIndex(s => s.id === instance.currentStepId);
    const nextStepIndex = currentStepIndex + 1;

    if (nextStepIndex < instance.steps.length) {
      // Move to next step
      const nextStep = instance.steps[nextStepIndex];
      nextStep.status = 'in_progress';
      nextStep.startedAt = new Date().toISOString();
      instance.currentStepId = nextStep.id;

      this.createApprovalTasks(instance, nextStep);
    } else {
      // Workflow complete
      instance.status = 'completed';
      instance.completedAt = new Date().toISOString();
      instance.currentStepId = undefined;
    }
  }

  getWorkflowInstance(id: string): WorkflowInstance | null {
    return this.instances.get(id) || null;
  }

  getInstancesByEntity(entityType: string, entityId: string): WorkflowInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.entityType === entityType && instance.entityId === entityId);
  }

  getUserTasks(userEmail: string): ApprovalTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.assignedTo === userEmail && task.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getOverdueTasks(): ApprovalTask[] {
    const now = new Date();
    return Array.from(this.tasks.values())
      .filter(task => {
        if (task.status !== 'pending' || !task.dueDate) return false;
        return new Date(task.dueDate) < now;
      })
      .map(task => ({ ...task, status: 'overdue' as const }));
  }

  getWorkflows(): ApprovalWorkflow[] {
    return Array.from(this.workflows.values());
  }

  getActiveInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.status === 'active');
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
