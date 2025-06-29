
export interface SystemSettings {
  id: string;
  category: 'general' | 'security' | 'notifications' | 'integrations' | 'compliance';
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  isRequired: boolean;
  isVisible: boolean;
  validation?: ValidationRule[];
  updatedBy: string;
  updatedAt: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  department?: string;
  phone?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  defaultValue?: any;
  isRequired: boolean;
  validation: ValidationRule[];
  options?: FormFieldOption[];
  conditionalLogic?: ConditionalLogic[];
  order: number;
  width: 'full' | 'half' | 'third' | 'quarter';
}

export interface FormFieldOption {
  label: string;
  value: any;
  isDefault?: boolean;
}

export interface ConditionalLogic {
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  targetFieldId: string;
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface CustomForm {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  showProgressBar: boolean;
  redirectUrl?: string;
  emailNotifications: string[];
  saveAsDraft: boolean;
}

export interface ReportComponent {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'image' | 'divider';
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
  dataSource?: string;
  filters?: ReportFilter[];
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  label: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  category: string;
  components: ReportComponent[];
  layout: 'single' | 'grid' | 'dashboard';
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'merge' | 'delay' | 'notification';
  name: string;
  position: { x: number; y: number };
  config: WorkflowNodeConfig;
  connections: WorkflowConnection[];
}

export interface WorkflowConnection {
  targetNodeId: string;
  condition?: WorkflowCondition;
  label?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
}

export interface WorkflowNodeConfig {
  assignee?: string;
  role?: string;
  timeoutDays?: number;
  actions?: WorkflowAction[];
  message?: string;
  template?: string;
  delayDuration?: number;
  delayUnit?: 'minutes' | 'hours' | 'days';
}

export interface WorkflowAction {
  type: 'email' | 'notification' | 'webhook' | 'status_update' | 'assignment';
  config: Record<string, any>;
}

export interface CustomWorkflow {
  id: string;
  name: string;
  description?: string;
  triggerType: 'manual' | 'automatic' | 'scheduled';
  triggerConditions: WorkflowCondition[];
  nodes: WorkflowNode[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
