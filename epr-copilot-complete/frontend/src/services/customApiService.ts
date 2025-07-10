
import { CustomAPI, APIParameter } from '../types/integrations';
import { APP_CONFIG } from '../config/constants';
import { authService } from './authService';

export class CustomApiService {
  private apis: Map<string, CustomAPI> = new Map();

  constructor() {
    this.initializeMockAPIs();
  }

  private initializeMockAPIs() {
  }

  getAPIs(): CustomAPI[] {
    return Array.from(this.apis.values());
  }

  getAPI(id: string): CustomAPI | undefined {
    return this.apis.get(id);
  }

  async createAPI(apiData: Omit<CustomAPI, 'id' | 'usage' | 'lastUsed'>): Promise<CustomAPI> {
    const newAPI: CustomAPI = {
      ...apiData,
      id: Math.random().toString(36).substr(2, 9),
      usage: 0
    };

    this.apis.set(newAPI.id, newAPI);
    return newAPI;
  }

  async updateAPI(id: string, updates: Partial<CustomAPI>): Promise<CustomAPI | null> {
    const api = this.apis.get(id);
    if (!api) return null;

    const updated = { ...api, ...updates };
    this.apis.set(id, updated);
    return updated;
  }

  async testAPI(id: string): Promise<any> {
    const api = this.apis.get(id);
    if (!api) {
      throw new Error('API not found');
    }
    
    const token = authService.getAccessToken();
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/integrations/test/${api.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: api.endpoint,
        method: api.method,
        headers: api.headers
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'API test failed' }));
      throw new Error(error.detail || `API test failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      status: response.status,
      data: result.data || result,
      responseTime: result.responseTime || 0,
      timestamp: new Date().toISOString()
    };
  }

  async callAPI(id: string, parameters: Record<string, any>): Promise<any> {
    const api = this.apis.get(id);
    if (!api || !api.isActive) {
      throw new Error('API not found or inactive');
    }

    const token = authService.getAccessToken();
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/integrations/call/${api.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        parameters,
        endpoint: api.endpoint,
        method: api.method,
        headers: api.headers
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'API call failed' }));
      throw new Error(error.detail || `API call failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // Update local usage statistics
    api.usage++;
    api.lastUsed = new Date().toISOString();
    this.apis.set(api.id, api);

    return {
      success: true,
      data: result.data || result,
      timestamp: result.timestamp || new Date().toISOString()
    };
  }

  deleteAPI(id: string): boolean {
    return this.apis.delete(id);
  }

  getUsageStats(): any {
    const apis = this.getAPIs();
    return {
      totalAPIs: apis.length,
      activeAPIs: apis.filter(api => api.isActive).length,
      totalCalls: apis.reduce((sum, api) => sum + api.usage, 0),
      averageResponseTime: 250 // Mock value
    };
  }
}

export const customApiService = new CustomApiService();
