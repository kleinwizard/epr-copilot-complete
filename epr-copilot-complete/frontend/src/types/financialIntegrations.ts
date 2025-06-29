
export interface IntegrationProvider {
  id: string;
  name: string;
  type: 'accounting' | 'erp' | 'payment' | 'banking';
  logoUrl?: string;
  description: string;
  features: string[];
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
  lastSyncTime: string;
}

export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
  reference: string;
  category: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity';
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  eprFeeRevenue: number;
  processingFees: number;
  entries: AccountingEntry[];
}
