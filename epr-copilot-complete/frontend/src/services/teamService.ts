
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  department: string;
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  joinedDate: string;
  avatar?: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  department: string;
  invitedBy: string;
  invitedDate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface RolePermissions {
  role: string;
  permissions: {
    dashboard: { view: boolean; edit: boolean };
    company: { view: boolean; edit: boolean };
    products: { view: boolean; edit: boolean; delete: boolean };
    materials: { view: boolean; edit: boolean; delete: boolean };
    fees: { view: boolean; edit: boolean };
    reports: { view: boolean; edit: boolean; submit: boolean };
    analytics: { view: boolean };
    calendar: { view: boolean; edit: boolean };
    team: { view: boolean; edit: boolean; invite: boolean; remove: boolean };
    settings: { view: boolean; edit: boolean };
  };
}

// Mock data for team members
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    department: 'Sustainability',
    status: 'active',
    lastActive: '2024-01-20T10:30:00Z',
    joinedDate: '2023-06-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'manager',
    department: 'Operations',
    status: 'active',
    lastActive: '2024-01-20T09:15:00Z',
    joinedDate: '2023-08-22T00:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'user',
    department: 'Product',
    status: 'active',
    lastActive: '2024-01-19T16:45:00Z',
    joinedDate: '2023-11-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    role: 'viewer',
    department: 'Finance',
    status: 'pending',
    lastActive: '2024-01-18T14:20:00Z',
    joinedDate: '2024-01-15T00:00:00Z'
  }
];

const mockInvitations: TeamInvitation[] = [
  {
    id: '1',
    email: 'new.user@company.com',
    role: 'user',
    department: 'Operations',
    invitedBy: 'John Doe',
    invitedDate: '2024-01-18T00:00:00Z',
    status: 'pending'
  },
  {
    id: '2',
    email: 'contractor@external.com',
    role: 'viewer',
    department: 'Consulting',
    invitedBy: 'Sarah Wilson',
    invitedDate: '2024-01-17T00:00:00Z',
    status: 'pending'
  }
];

const rolePermissions: RolePermissions[] = [
  {
    role: 'admin',
    permissions: {
      dashboard: { view: true, edit: true },
      company: { view: true, edit: true },
      products: { view: true, edit: true, delete: true },
      materials: { view: true, edit: true, delete: true },
      fees: { view: true, edit: true },
      reports: { view: true, edit: true, submit: true },
      analytics: { view: true },
      calendar: { view: true, edit: true },
      team: { view: true, edit: true, invite: true, remove: true },
      settings: { view: true, edit: true }
    }
  },
  {
    role: 'manager',
    permissions: {
      dashboard: { view: true, edit: true },
      company: { view: true, edit: false },
      products: { view: true, edit: true, delete: false },
      materials: { view: true, edit: true, delete: false },
      fees: { view: true, edit: true },
      reports: { view: true, edit: true, submit: true },
      analytics: { view: true },
      calendar: { view: true, edit: true },
      team: { view: true, edit: false, invite: true, remove: false },
      settings: { view: true, edit: false }
    }
  },
  {
    role: 'user',
    permissions: {
      dashboard: { view: true, edit: false },
      company: { view: true, edit: false },
      products: { view: true, edit: true, delete: false },
      materials: { view: true, edit: true, delete: false },
      fees: { view: true, edit: false },
      reports: { view: true, edit: true, submit: false },
      analytics: { view: true },
      calendar: { view: true, edit: false },
      team: { view: true, edit: false, invite: false, remove: false },
      settings: { view: false, edit: false }
    }
  },
  {
    role: 'viewer',
    permissions: {
      dashboard: { view: true, edit: false },
      company: { view: true, edit: false },
      products: { view: true, edit: false, delete: false },
      materials: { view: true, edit: false, delete: false },
      fees: { view: true, edit: false },
      reports: { view: true, edit: false, submit: false },
      analytics: { view: true },
      calendar: { view: true, edit: false },
      team: { view: false, edit: false, invite: false, remove: false },
      settings: { view: false, edit: false }
    }
  }
];

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const response = await fetch('/api/team/members', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};

export const getTeamInvitations = async (): Promise<TeamInvitation[]> => {
  try {
    const response = await fetch('/api/team/invitations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch team invitations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching team invitations:', error);
    return [];
  }
};

export const getRolePermissions = (role: string): RolePermissions | undefined => {
  return rolePermissions.find(rp => rp.role === role);
};

export const getAllRolePermissions = (): RolePermissions[] => {
  return rolePermissions;
};

export const getTeamStats = async () => {
  try {
    const response = await fetch('/api/team/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch team stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return {
      totalMembers: 0,
      activeMembers: 0,
      pendingInvitations: 0,
      roles: { admin: 0, manager: 0, user: 0, viewer: 0 }
    };
  }
};

export const inviteTeamMember = async (invitation: Omit<TeamInvitation, 'id' | 'invitedDate' | 'status'>): Promise<TeamInvitation> => {
  try {
    const response = await fetch('/api/team/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: invitation.email,
        role: invitation.role,
        department: invitation.department
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send team invitation');
    }
    
    const result = await response.json();
    return result.invitation;
  } catch (error) {
    console.error('Error sending team invitation:', error);
    throw error;
  }
};

export const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
  const index = mockTeamMembers.findIndex(m => m.id === id);
  if (index !== -1) {
    mockTeamMembers[index] = { ...mockTeamMembers[index], ...updates };
    return mockTeamMembers[index];
  }
  return null;
};

export const removeTeamMember = (id: string) => {
  const index = mockTeamMembers.findIndex(m => m.id === id);
  if (index !== -1) {
    return mockTeamMembers.splice(index, 1)[0];
  }
  return null;
};
