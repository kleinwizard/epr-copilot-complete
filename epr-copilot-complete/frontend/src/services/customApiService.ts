
import { CustomAPI, APIParameter } from '../types/integrations';
import { APP_CONFIG } from '../config/constants';

export class CustomApiService {
  private apis: Map<string, CustomAPI> = new Map();

  constructor() {
    this.initializeMockAPIs();
  }

  private initializeMockAPIs() {
    const mockAPIs: CustomAPI[] = [
      {
        id: 'api-001',
        name: 'Material Database Lookup',
        description: 'Lookup material properties and recycling information',
        endpoint: 'https://api.materialdb.com/lookup',
        method: 'GET',
        authentication: 'api_key',
        headers: { 'Content-Type': 'application/json' },
        parameters: [
          {
            name: 'material_id',
            type: 'string',
            required: true,
            description: 'Unique material identifier'
          },
          {
            name: 'include_recycling',
            type: 'boolean',
            required: false,
            description: 'Include recycling information',
            defaultValue: true
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            material: { type: 'object' },
            recycling: { type: 'object' }
          }
        },
        isActive: true,
        usage: 1247,
        lastUsed: '2024-06-24T10:15:00Z'
      }
    ];

    mockAPIs.forEach(api => {
      this.apis.set(api.id, api);
    });
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

    console.log(`Testing API: ${api.name}`);
    
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/integrations/test/${api.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const mockResponse = {
      status: 200,
      data: { message: 'API test successful', timestamp: new Date().toISOString() },
      responseTime: Math.floor(Math.random() * 500) + 100
    };

    return mockResponse;
  }

  async callAPI(id: string, parameters: Record<string, any>): Promise<any> {
    const api = this.apis.get(id);
    if (!api || !api.isActive) {
      throw new Error('API not found or inactive');
    }

    console.log(`Calling API: ${api.name} with parameters:`, parameters);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/integrations/call/${api.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters }),
    });

    // Update usage statistics
    api.usage++;
    api.lastUsed = new Date().toISOString();

    return {
      success: true,
      data: { result: 'Mock API response', parameters },
      timestamp: new Date().toISOString()
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
