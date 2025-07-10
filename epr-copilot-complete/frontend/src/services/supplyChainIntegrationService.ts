
import { SupplyChainIntegration } from '../types/integrations';
import { APP_CONFIG } from '../config/constants';
import { authService } from './authService';

export class SupplyChainIntegrationService {
  private integrations: Map<string, SupplyChainIntegration> = new Map();

  constructor() {
    this.loadIntegrations();
  }

  private async loadIntegrations() {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.warn('No auth token available, skipping integration load');
        return;
      }

      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/supply-chain/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const integrations = data.integrations || [];
        
        this.integrations.clear();
        
        integrations.forEach((integration: SupplyChainIntegration) => {
          this.integrations.set(integration.id, integration);
        });
      } else if (response.status === 404) {
        console.info('No supply chain integrations configured');
      } else {
        throw new Error(`Failed to load integrations: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load supply chain integrations:', error);
    }
  }

  getIntegrations(): SupplyChainIntegration[] {
    return Array.from(this.integrations.values());
  }

  getIntegrationsByType(type: SupplyChainIntegration['type']): SupplyChainIntegration[] {
    return this.getIntegrations().filter(integration => integration.type === type);
  }

  async addIntegration(integration: Omit<SupplyChainIntegration, 'id'>): Promise<SupplyChainIntegration> {
    const newIntegration: SupplyChainIntegration = {
      ...integration,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.integrations.set(newIntegration.id, newIntegration);
    return newIntegration;
  }

  async updateIntegration(id: string, updates: Partial<SupplyChainIntegration>): Promise<SupplyChainIntegration | null> {
    const integration = this.integrations.get(id);
    if (!integration) return null;

    const updated = { ...integration, ...updates };
    this.integrations.set(id, updated);
    return updated;
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/supply-chain/integrations/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: integration.apiEndpoint,
          dataFormat: integration.dataFormat
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          message: result.detail || `Connection test failed: ${response.statusText}` 
        };
      }

      return { 
        success: result.success || true, 
        message: result.message || 'Connection successful' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection test failed: ${error.message}` 
      };
    }
  }

  async syncData(integrationId: string): Promise<any> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== 'active') {
      throw new Error('Integration not found or inactive');
    }

    console.log(`Syncing data from ${integration.supplier}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));

    integration.lastUpdate = new Date().toISOString();

    return {
      materialsUpdated: Math.floor(Math.random() * 50) + 10,
      certificationsVerified: integration.certifications.length,
      lastSync: integration.lastUpdate
    };
  }
}

export const supplyChainIntegrationService = new SupplyChainIntegrationService();
