
import { Workspace, WorkspaceMember, WorkspaceDocument } from '../types/communication';

export class WorkspaceService {
  private workspaces: Map<string, Workspace> = new Map();

  constructor() {
    this.initializeMockWorkspaces();
  }

  private initializeMockWorkspaces() {
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
