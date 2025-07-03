
import { EcommerceIntegration } from '../types/integrations';

export class EcommerceIntegrationService {
  private integrations: Map<string, EcommerceIntegration> = new Map();

  constructor() {
    this.initializeMockIntegrations();
  }

  private initializeMockIntegrations() {
    const mockIntegrations: EcommerceIntegration[] = [];

    mockIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  getIntegrations(): EcommerceIntegration[] {
    return Array.from(this.integrations.values());
  }

  getIntegrationsByPlatform(platform: EcommerceIntegration['platform']): EcommerceIntegration[] {
    return this.getIntegrations().filter(integration => integration.platform === platform);
  }

  async connectIntegration(config: Omit<EcommerceIntegration, 'id' | 'status'>): Promise<EcommerceIntegration> {
    const newIntegration: EcommerceIntegration = {
      ...config,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };

    this.integrations.set(newIntegration.id, newIntegration);

    // Simulate connection process
    setTimeout(() => {
      newIntegration.status = Math.random() > 0.2 ? 'connected' : 'error';
      if (newIntegration.status === 'connected') {
        newIntegration.lastSync = new Date().toISOString();
      }
    }, 2000);

    return newIntegration;
  }

  async syncIntegration(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== 'connected') {
      throw new Error('Integration not found or not connected');
    }

    console.log(`Syncing ${integration.platform} integration: ${integration.name}`);
    
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    integration.lastSync = new Date().toISOString();
    return true;
  }

  async testConnection(integrationId: string): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    console.log(`Testing connection for ${integration.name}...`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    return Math.random() > 0.2;
  }

  disconnectIntegration(integrationId: string): boolean {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.status = 'disconnected';
      integration.lastSync = undefined;
      return true;
    }
    return false;
  }
}

export const ecommerceIntegrationService = new EcommerceIntegrationService();
