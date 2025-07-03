
import { Webhook, WebhookLog } from '../types/integrations';

export class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();
  private logs: Map<string, WebhookLog[]> = new Map();

  constructor() {
  }

  getWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  async createWebhook(webhookData: Omit<Webhook, 'id' | 'successRate' | 'lastTriggered'>): Promise<Webhook> {
    const newWebhook: Webhook = {
      ...webhookData,
      id: Math.random().toString(36).substr(2, 9),
      successRate: 100
    };

    this.webhooks.set(newWebhook.id, newWebhook);
    this.logs.set(newWebhook.id, []);
    return newWebhook;
  }

  async updateWebhook(id: string, updates: Partial<Webhook>): Promise<Webhook | null> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;

    const updated = { ...webhook, ...updates };
    this.webhooks.set(id, updated);
    return updated;
  }

  async triggerWebhook(webhookId: string, event: string, payload: any): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook || !webhook.isActive) {
      throw new Error('Webhook not found or inactive');
    }

    if (!webhook.events.includes(event)) {
      throw new Error(`Event ${event} not subscribed by webhook`);
    }

    console.log(`Triggering webhook: ${webhook.name} for event: ${event}`);

    const logEntry: WebhookLog = {
      id: Math.random().toString(36).substr(2, 9),
      webhookId,
      event,
      payload,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    // Add to logs
    const webhookLogs = this.logs.get(webhookId) || [];
    webhookLogs.unshift(logEntry);
    this.logs.set(webhookId, webhookLogs.slice(0, 100)); // Keep last 100 logs

    // Simulate webhook call
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate
          if (success) {
            resolve(true);
          } else {
            reject(new Error('Webhook delivery failed'));
          }
        }, 1000);
      });

      logEntry.status = 'success';
      logEntry.response = { status: 200, message: 'Webhook delivered successfully' };
      webhook.lastTriggered = new Date().toISOString();
      
      return true;
    } catch (error) {
      logEntry.status = 'failed';
      logEntry.response = { error: error.message };
      
      // Implement retry logic
      if (logEntry.retryCount < webhook.retryCount) {
        setTimeout(() => {
          this.retryWebhook(webhookId, logEntry.id);
        }, 5000 * Math.pow(2, logEntry.retryCount)); // Exponential backoff
      }
      
      return false;
    }
  }

  private async retryWebhook(webhookId: string, logId: string): Promise<void> {
    const webhookLogs = this.logs.get(webhookId) || [];
    const logEntry = webhookLogs.find(log => log.id === logId);
    
    if (!logEntry || logEntry.status === 'success') return;

    logEntry.retryCount++;
    logEntry.status = 'pending';

    // Simulate retry
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = Math.random() > 0.3; // Lower success rate on retry
      
      if (success) {
        logEntry.status = 'success';
        logEntry.response = { status: 200, message: 'Webhook delivered on retry' };
      } else {
        throw new Error('Retry failed');
      }
    } catch (error) {
      logEntry.status = 'failed';
      
      // Continue retrying if under limit
      const webhook = this.webhooks.get(webhookId);
      if (webhook && logEntry.retryCount < webhook.retryCount) {
        setTimeout(() => {
          this.retryWebhook(webhookId, logId);
        }, 5000 * Math.pow(2, logEntry.retryCount));
      }
    }
  }

  async testWebhook(webhookId: string): Promise<boolean> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    console.log(`Testing webhook: ${webhook.name}`);
    
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook delivery'
    };

    return this.triggerWebhook(webhookId, 'test.event', testPayload);
  }

  getWebhookLogs(webhookId: string): WebhookLog[] {
    return this.logs.get(webhookId) || [];
  }

  deleteWebhook(id: string): boolean {
    this.logs.delete(id);
    return this.webhooks.delete(id);
  }

  getWebhookStats(): any {
    const webhooks = this.getWebhooks();
    const allLogs = Array.from(this.logs.values()).flat();
    
    return {
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter(w => w.isActive).length,
      totalDeliveries: allLogs.length,
      successfulDeliveries: allLogs.filter(log => log.status === 'success').length,
      failedDeliveries: allLogs.filter(log => log.status === 'failed').length,
      averageSuccessRate: webhooks.length > 0 
        ? webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length 
        : 0
    };
  }
}

export const webhookService = new WebhookService();
