
import { IntegrationProvider, SyncResult, AccountingEntry, FinancialReport } from '../types/financialIntegrations';
import { integrationProvidersService } from './integrationProvidersService';
import { accountingEntriesService } from './accountingEntriesService';
import { financialReportingService } from './financialReportingService';

export class FinancialIntegrationsService {
  // Provider Management - delegate to integrationProvidersService
  getProviders(type?: IntegrationProvider['type']): IntegrationProvider[] {
    return integrationProvidersService.getProviders(type);
  }

  getProvider(providerId: string): IntegrationProvider | null {
    return integrationProvidersService.getProvider(providerId);
  }

  async connectProvider(providerId: string, credentials: Record<string, any>): Promise<boolean> {
    return integrationProvidersService.connectProvider(providerId, credentials);
  }

  async disconnectProvider(providerId: string): Promise<boolean> {
    return integrationProvidersService.disconnectProvider(providerId);
  }

  async syncProvider(providerId: string): Promise<SyncResult> {
    return integrationProvidersService.syncProvider(providerId);
  }

  // Accounting Integration Methods - delegate to accountingEntriesService
  createAccountingEntry(entry: Omit<AccountingEntry, 'id'>): AccountingEntry {
    return accountingEntriesService.createAccountingEntry(entry);
  }

  getAccountingEntries(startDate?: string, endDate?: string): AccountingEntry[] {
    return accountingEntriesService.getAccountingEntries(startDate, endDate);
  }

  convertInvoiceToAccountingEntries(
    invoice: any,
    receivableAccount: string = '1200 - Accounts Receivable',
    revenueAccount: string = '4000 - EPR Fee Revenue'
  ): AccountingEntry[] {
    return accountingEntriesService.convertInvoiceToAccountingEntries(invoice, receivableAccount, revenueAccount);
  }

  convertPaymentToAccountingEntries(
    payment: any,
    cashAccount: string = '1000 - Cash',
    receivableAccount: string = '1200 - Accounts Receivable',
    feeExpenseAccount: string = '5000 - Payment Processing Fees'
  ): AccountingEntry[] {
    return accountingEntriesService.convertPaymentToAccountingEntries(payment, cashAccount, receivableAccount, feeExpenseAccount);
  }

  // Financial Reporting - delegate to financialReportingService
  generateFinancialReport(startDate: string, endDate: string): FinancialReport {
    const entries = this.getAccountingEntries(startDate, endDate);
    return financialReportingService.generateFinancialReport(entries, startDate, endDate);
  }

  exportToQuickBooks(entries: AccountingEntry[]): string {
    return financialReportingService.exportToQuickBooks(entries);
  }

  exportToXero(entries: AccountingEntry[]): string {
    return financialReportingService.exportToXero(entries);
  }

  exportToSage(entries: AccountingEntry[]): any {
    return financialReportingService.exportToSage(entries);
  }
}

export const financialIntegrationsService = new FinancialIntegrationsService();

// Re-export types and services for convenience
export type { IntegrationProvider, SyncResult, AccountingEntry, FinancialReport };
export { integrationProvidersService, accountingEntriesService, financialReportingService };
