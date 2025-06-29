
import { SupplyChainIntegration } from '../types/integrations';

export class SupplyChainIntegrationService {
  private integrations: Map<string, SupplyChainIntegration> = new Map();

  constructor() {
    this.initializeMockIntegrations();
  }

  private initializeMockIntegrations() {
    const mockIntegrations: SupplyChainIntegration[] = [
      {
        id: 'supplier-001',
        supplier: 'Green Packaging Solutions',
        type: 'packaging',
        status: 'active',
        apiEndpoint: 'https://api.greenpackaging.com/v1',
        dataFormat: 'json',
        lastUpdate: '2024-06-24T08:00:00Z',
        certifications: ['FSC', 'PEFC', 'Recyclable']
      },
      {
        id: 'supplier-002',
        supplier: 'EcoMaterials Corp',
        type: 'raw_materials',
        status: 'active',
        apiEndpoint: 'https://api.ecomaterials.com/v2',
        dataFormat: 'xml',
        lastUpdate: '2024-06-24T06:30:00Z',
        certifications: ['Bio-based', 'Compostable', 'Carbon Neutral']
      }
    ];

    mockIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
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

  async testConnection(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    console.log(`Testing connection to ${integration.supplier}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    return Math.random() > 0.15;
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
