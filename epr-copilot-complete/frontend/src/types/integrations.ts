
export interface EcommerceIntegration {
  id: string;
  platform: 'shopify' | 'amazon' | 'ebay' | 'woocommerce' | 'magento' | 'bigcommerce';
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  storeUrl?: string;
  apiKey?: string;
  lastSync?: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  dataTypes: string[];
  productCount?: number;
  orderCount?: number;
}

export interface SupplyChainIntegration {
  id: string;
  supplier: string;
  type: 'raw_materials' | 'packaging' | 'finished_goods' | 'logistics';
  status: 'active' | 'inactive' | 'pending';
  apiEndpoint?: string;
  dataFormat: 'json' | 'xml' | 'csv' | 'edi';
  lastUpdate?: string;
  certifications: string[];
}

export interface CustomAPI {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  authentication: 'none' | 'api_key' | 'oauth' | 'basic';
  headers: Record<string, string>;
  parameters: APIParameter[];
  responseSchema: any;
  isActive: boolean;
  usage: number;
  lastUsed?: string;
}

export interface APIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  retryCount: number;
  lastTriggered?: string;
  successRate: number;
  headers: Record<string, string>;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  response?: any;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  retryCount: number;
}
