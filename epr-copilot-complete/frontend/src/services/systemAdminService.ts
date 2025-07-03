
import { SystemSettings, SystemUser, AuditLog } from '../types/admin';

export class SystemAdminService {
  private settings: Map<string, SystemSettings> = new Map();
  private users: Map<string, SystemUser> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
  }

  getSettings(category?: string): SystemSettings[] {
    let results = Array.from(this.settings.values());
    
    if (category) {
      results = results.filter(setting => setting.category === category);
    }
    
    return results.filter(setting => setting.isVisible);
  }

  getSetting(id: string): SystemSettings | null {
    return this.settings.get(id) || null;
  }

  async updateSetting(id: string, value: any, updatedBy: string): Promise<boolean> {
    const setting = this.settings.get(id);
    if (!setting) return false;

    // Validate the new value
    if (!this.validateSettingValue(setting, value)) return false;

    setting.value = value;
    setting.updatedBy = updatedBy;
    setting.updatedAt = new Date().toISOString();

    // Log the change
    this.logAction(updatedBy, 'update_setting', 'system_setting', id, {
      oldValue: setting.value,
      newValue: value
    });

    return true;
  }

  private validateSettingValue(setting: SystemSettings, value: any): boolean {
    for (const rule of setting.validation || []) {
      switch (rule.type) {
        case 'required':
          if (value === null || value === undefined || value === '') return false;
          break;
        case 'min':
          if (typeof value === 'number' && value < rule.value) return false;
          if (typeof value === 'string' && value.length < rule.value) return false;
          break;
        case 'max':
          if (typeof value === 'number' && value > rule.value) return false;
          if (typeof value === 'string' && value.length > rule.value) return false;
          break;
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) return false;
          break;
      }
    }
    return true;
  }

  getUsers(): SystemUser[] {
    return Array.from(this.users.values()).sort((a, b) => a.email.localeCompare(b.email));
  }

  getUser(id: string): SystemUser | null {
    return this.users.get(id) || null;
  }

  async createUser(userData: Omit<SystemUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<SystemUser> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: SystemUser = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, newUser);
    this.logAction('system', 'create_user', 'user', id, { email: userData.email });
    return newUser;
  }

  async updateUser(id: string, updates: Partial<SystemUser>, updatedBy: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    const oldValues = { ...user };
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });

    this.logAction(updatedBy, 'update_user', 'user', id, { oldValues, newValues: user });
    return true;
  }

  async deleteUser(id: string, deletedBy: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.logAction(deletedBy, 'delete_user', 'user', id, { email: user.email });
    return true;
  }

  private logAction(userId: string, action: string, entityType: string, entityId: string, details: Record<string, any>) {
    const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditLog: AuditLog = {
      id: logId,
      userId,
      userEmail: userId === 'system' ? 'system' : this.users.get(userId)?.email || 'unknown',
      action,
      entityType,
      entityId,
      details,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      timestamp: new Date().toISOString(),
      severity: 'medium'
    };

    this.auditLogs.set(logId, auditLog);
  }

  getAuditLogs(limit: number = 100): AuditLog[] {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  exportSystemData(): string {
    const data = {
      settings: Array.from(this.settings.values()),
      users: Array.from(this.users.values()),
      auditLogs: Array.from(this.auditLogs.values())
    };

    return JSON.stringify(data, null, 2);
  }
}

export const systemAdminService = new SystemAdminService();
