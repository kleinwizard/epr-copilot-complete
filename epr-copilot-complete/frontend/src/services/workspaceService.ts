
import { Workspace, WorkspaceMember, WorkspaceDocument } from '../types/communication';

export class WorkspaceService {
  private workspaces: Map<string, Workspace> = new Map();

  constructor() {
    this.initializeMockWorkspaces();
  }

  private initializeMockWorkspaces() {
    const mockWorkspaces: Workspace[] = [
      {
        id: 'workspace-1',
        name: 'Q2 2024 Compliance',
        description: 'Workspace for Q2 2024 quarterly reporting and compliance activities',
        type: 'compliance',
        members: [
          {
            userId: 'user-1',
            userName: 'Sarah Johnson',
            role: 'owner',
            permissions: ['read', 'write', 'admin'],
            joinedAt: '2024-04-01T09:00:00Z'
          },
          {
            userId: 'user-2',
            userName: 'Mike Chen',
            role: 'member',
            permissions: ['read', 'write'],
            joinedAt: '2024-04-02T10:30:00Z'
          }
        ],
        channels: ['general', 'compliance-updates'],
        documents: [
          {
            id: 'doc-1',
            name: 'Q2 Material Report Draft.pdf',
            type: 'report',
            url: '/documents/q2-material-report.pdf',
            size: 2048576,
            uploadedBy: 'user-1',
            uploadedAt: '2024-06-20T14:30:00Z',
            version: '1.2',
            tags: ['draft', 'materials', 'q2']
          }
        ],
        createdBy: 'user-1',
        createdAt: '2024-04-01T09:00:00Z',
        isPrivate: false,
        tags: ['compliance', 'reporting', 'q2-2024']
      },
      {
        id: 'workspace-2',
        name: 'Vendor Collaboration',
        description: 'Shared workspace for vendor communications and document exchange',
        type: 'vendor',
        members: [
          {
            userId: 'user-1',
            userName: 'Sarah Johnson',
            role: 'admin',
            permissions: ['read', 'write', 'admin'],
            joinedAt: '2024-03-15T11:00:00Z'
          },
          {
            userId: 'vendor-1',
            userName: 'Jennifer Martinez',
            role: 'member',
            permissions: ['read', 'write'],
            joinedAt: '2024-03-16T09:30:00Z'
          }
        ],
        channels: ['vendor-general', 'material-specs'],
        documents: [],
        createdBy: 'user-1',
        createdAt: '2024-03-15T11:00:00Z',
        isPrivate: true,
        tags: ['vendor', 'collaboration', 'materials']
      }
    ];

    mockWorkspaces.forEach(workspace => {
      this.workspaces.set(workspace.id, workspace);
    });
  }

  getWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  getWorkspaceById(workspaceId: string): Workspace | undefined {
    return this.workspaces.get(workspaceId);
  }

  getWorkspacesByType(type: Workspace['type']): Workspace[] {
    return this.getWorkspaces().filter(workspace => workspace.type === type);
  }

  async createWorkspace(workspaceData: Omit<Workspace, 'id' | 'createdAt'>): Promise<Workspace> {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: `workspace-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.workspaces.set(newWorkspace.id, newWorkspace);
    return newWorkspace;
  }

  async addMember(workspaceId: string, member: WorkspaceMember): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      const existingMember = workspace.members.find(m => m.userId === member.userId);
      if (!existingMember) {
        workspace.members.push(member);
        return true;
      }
    }
    return false;
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      const memberIndex = workspace.members.findIndex(m => m.userId === userId);
      if (memberIndex > -1) {
        workspace.members.splice(memberIndex, 1);
        return true;
      }
    }
    return false;
  }

  async uploadDocument(workspaceId: string, document: WorkspaceDocument): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId);
    if (workspace) {
      workspace.documents.push(document);
      return true;
    }
    return false;
  }

  searchWorkspaces(query: string): Workspace[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getWorkspaces().filter(workspace =>
      workspace.name.toLowerCase().includes(lowercaseQuery) ||
      workspace.description?.toLowerCase().includes(lowercaseQuery) ||
      workspace.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const workspaceService = new WorkspaceService();
