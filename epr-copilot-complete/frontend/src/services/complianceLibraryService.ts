
import { CalculationEngine } from './calculationEngine';

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  type: 'regulation' | 'standard' | 'policy' | 'guideline' | 'law';
  jurisdiction: string;
  authority: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'active' | 'pending' | 'deprecated' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  applicableProducts: string[];
  requirements: RequirementDetail[];
  penalties: Penalty[];
  deadlines: ComplianceDeadline[];
  relatedDocuments: string[];
  tags: string[];
}

export interface RequirementDetail {
  id: string;
  section: string;
  requirement: string;
  compliance: 'mandatory' | 'recommended' | 'optional';
  evidence: string[];
  frequency: 'once' | 'annual' | 'quarterly' | 'monthly' | 'ongoing';
}

export interface Penalty {
  type: 'fine' | 'suspension' | 'revocation' | 'warning';
  description: string;
  amount?: number;
  currency?: string;
  conditions: string[];
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'submission' | 'payment' | 'registration' | 'renewal';
  isRecurring: boolean;
  recurringPattern?: 'yearly' | 'quarterly' | 'monthly';
}

export interface ComplianceChecklist {
  id: string;
  requirementId: string;
  title: string;
  items: ChecklistItem[];
  completedBy?: string;
  completedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'reviewed';
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  evidence?: string[];
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export class ComplianceLibraryService {
  private requirements: Map<string, ComplianceRequirement> = new Map();
  private checklists: Map<string, ComplianceChecklist> = new Map();
  private supportedJurisdictions: Array<{code: string, name: string, model_type: string}> = [];

  constructor() {
    this.loadRealData();
    this.loadSupportedJurisdictions();
  }

  private async loadRealData() {
    try {
      const storedData = localStorage.getItem('compliance_requirements');
      if (storedData) {
        const requirements: ComplianceRequirement[] = JSON.parse(storedData);
        requirements.forEach(req => this.requirements.set(req.id, req));
      } else {
        await this.loadDefaultRequirements();
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      await this.loadDefaultRequirements();
    }
  }

  private async loadSupportedJurisdictions() {
    try {
      this.supportedJurisdictions = await CalculationEngine.getSupportedJurisdictions();
    } catch (error) {
      console.error('Failed to load supported jurisdictions:', error);
      this.supportedJurisdictions = [
        { code: 'OR', name: 'Oregon', model_type: 'PRO-led Fee System' },
        { code: 'CA', name: 'California', model_type: 'PRO-led Fee System' },
        { code: 'CO', name: 'Colorado', model_type: 'Municipal Reimbursement' },
        { code: 'ME', name: 'Maine', model_type: 'Full Municipal Reimbursement' },
        { code: 'MD', name: 'Maryland', model_type: 'Shared Responsibility' },
        { code: 'MN', name: 'Minnesota', model_type: 'Shared Responsibility' },
        { code: 'WA', name: 'Washington', model_type: 'Shared Responsibility' },
        { code: 'EU', name: 'European Union', model_type: 'Extended Producer Responsibility' }
      ];
    }
  }

  private async loadDefaultRequirements() {
    const defaultRequirements: ComplianceRequirement[] = [
      {
        id: 'req-1',
        title: 'California EPR Packaging Waste Regulation',
        description: 'Extended Producer Responsibility requirements for packaging materials in California',
        type: 'regulation',
        jurisdiction: 'CA',
        authority: 'California Department of Resources Recycling and Recovery (CalRecycle)',
        effectiveDate: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-06-01T00:00:00Z',
        status: 'active',
        priority: 'critical',
        category: 'Packaging Waste',
        applicableProducts: ['packaging', 'containers', 'wrapping'],
        requirements: [
          {
            id: 'req-1-1',
            section: '18973.1',
            requirement: 'Submit annual packaging data report',
            compliance: 'mandatory',
            evidence: ['data report', 'material declarations'],
            frequency: 'annual'
          },
          {
            id: 'req-1-2',
            section: '18973.2',
            requirement: 'Pay annual EPR fees based on packaging volume',
            compliance: 'mandatory',
            evidence: ['payment receipt', 'fee calculation'],
            frequency: 'annual'
          }
        ],
        penalties: [
          {
            type: 'fine',
            description: 'Failure to submit annual report',
            amount: 10000,
            currency: 'USD',
            conditions: ['Late submission', 'Incomplete data']
          }
        ],
        deadlines: [
          {
            id: 'deadline-1',
            title: 'Annual Report Submission',
            date: '2025-03-31T23:59:59Z',
            description: 'Submit packaging data for previous year',
            type: 'submission',
            isRecurring: true,
            recurringPattern: 'yearly'
          }
        ],
        relatedDocuments: ['doc-1'],
        tags: ['epr', 'packaging', 'california', 'annual']
      },
      {
        id: 'req-2',
        title: 'Oregon EPR Packaging Waste Regulation',
        description: 'Extended Producer Responsibility requirements for packaging materials in Oregon',
        type: 'regulation',
        jurisdiction: 'OR',
        authority: 'Oregon Department of Environmental Quality (DEQ)',
        effectiveDate: '2025-01-01T00:00:00Z',
        lastUpdated: '2024-06-01T00:00:00Z',
        status: 'active',
        priority: 'critical',
        category: 'Packaging Waste',
        applicableProducts: ['packaging', 'containers', 'wrapping'],
        requirements: [
          {
            id: 'req-2-1',
            section: 'ORS 459A.865',
            requirement: 'Submit annual packaging data report',
            compliance: 'mandatory',
            evidence: ['data report', 'material declarations'],
            frequency: 'annual'
          },
          {
            id: 'req-2-2',
            section: 'ORS 459A.870',
            requirement: 'Pay annual EPR fees based on packaging volume',
            compliance: 'mandatory',
            evidence: ['payment receipt', 'fee calculation'],
            frequency: 'annual'
          }
        ],
        penalties: [
          {
            type: 'fine',
            description: 'Failure to submit annual report',
            amount: 5000,
            currency: 'USD',
            conditions: ['Late submission', 'Incomplete data']
          }
        ],
        deadlines: [
          {
            id: 'deadline-2',
            title: 'Annual Report Submission',
            date: '2025-04-30T23:59:59Z',
            description: 'Submit packaging data for previous year',
            type: 'submission',
            isRecurring: true,
            recurringPattern: 'yearly'
          }
        ],
        relatedDocuments: ['doc-2'],
        tags: ['epr', 'packaging', 'oregon', 'annual']
      }
    ];

    defaultRequirements.forEach(req => this.requirements.set(req.id, req));
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const requirements = Array.from(this.requirements.values());
      localStorage.setItem('compliance_requirements', JSON.stringify(requirements));
    } catch (error) {
      console.error('Failed to save compliance data:', error);
    }
  }

  getRequirements(jurisdiction?: string): ComplianceRequirement[] {
    let results = Array.from(this.requirements.values());
    
    if (jurisdiction) {
      results = results.filter(req => req.jurisdiction === jurisdiction);
    }

    return results.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  getRequirement(id: string): ComplianceRequirement | null {
    return this.requirements.get(id) || null;
  }

  searchRequirements(searchTerm: string): ComplianceRequirement[] {
    const term = searchTerm.toLowerCase();
    return Array.from(this.requirements.values()).filter(req =>
      req.title.toLowerCase().includes(term) ||
      req.description.toLowerCase().includes(term) ||
      req.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  getUpcomingDeadlines(days: number = 90): ComplianceDeadline[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const deadlines: ComplianceDeadline[] = [];
    
    this.requirements.forEach(req => {
      req.deadlines.forEach(deadline => {
        const deadlineDate = new Date(deadline.date);
        if (deadlineDate <= cutoffDate && deadlineDate > new Date()) {
          deadlines.push(deadline);
        }
      });
    });

    return deadlines.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  createChecklist(requirementId: string): ComplianceChecklist {
    const requirement = this.requirements.get(requirementId);
    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const id = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const checklist: ComplianceChecklist = {
      id,
      requirementId,
      title: `${requirement.title} - Compliance Checklist`,
      items: requirement.requirements.map(req => ({
        id: `item_${req.id}`,
        description: req.requirement,
        completed: false
      })),
      status: 'not_started'
    };

    this.checklists.set(id, checklist);
    return checklist;
  }

  updateChecklistItem(checklistId: string, itemId: string, updates: Partial<ChecklistItem>): boolean {
    const checklist = this.checklists.get(checklistId);
    if (!checklist) return false;

    const item = checklist.items.find(i => i.id === itemId);
    if (!item) return false;

    Object.assign(item, updates);
    
    if (updates.completed !== undefined) {
      item.completedAt = updates.completed ? new Date().toISOString() : undefined;
    }

    // Update checklist status
    const completedItems = checklist.items.filter(i => i.completed).length;
    const totalItems = checklist.items.length;
    
    if (completedItems === 0) {
      checklist.status = 'not_started';
    } else if (completedItems === totalItems) {
      checklist.status = 'completed';
    } else {
      checklist.status = 'in_progress';
    }

    return true;
  }

  getChecklist(id: string): ComplianceChecklist | null {
    return this.checklists.get(id) || null;
  }

  getChecklistsByRequirement(requirementId: string): ComplianceChecklist[] {
    return Array.from(this.checklists.values())
      .filter(checklist => checklist.requirementId === requirementId);
  }

  getComplianceScore(): number {
    const allChecklists = Array.from(this.checklists.values());
    if (allChecklists.length === 0) return 100;

    let totalItems = 0;
    let completedItems = 0;

    allChecklists.forEach(checklist => {
      totalItems += checklist.items.length;
      completedItems += checklist.items.filter(i => i.completed).length;
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
  }

  getSupportedJurisdictions(): Array<{code: string, name: string, model_type: string}> {
    return this.supportedJurisdictions;
  }

  getJurisdictionName(code: string): string {
    const jurisdiction = this.supportedJurisdictions.find(j => j.code === code);
    return jurisdiction ? jurisdiction.name : code;
  }
}

export const complianceLibraryService = new ComplianceLibraryService();
