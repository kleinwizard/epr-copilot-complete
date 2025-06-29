
import { FinancialReport, AccountingEntry } from '../types/financialIntegrations';

export class FinancialReportingService {
  generateFinancialReport(entries: AccountingEntry[], startDate: string, endDate: string): FinancialReport {
    const totalRevenue = entries
      .filter(e => e.category === 'revenue')
      .reduce((sum, e) => sum + e.credit, 0);
    
    const totalExpenses = entries
      .filter(e => e.category === 'expense')
      .reduce((sum, e) => sum + e.debit, 0);
    
    const eprFeeRevenue = entries
      .filter(e => e.category === 'revenue' && e.account.includes('EPR'))
      .reduce((sum, e) => sum + e.credit, 0);
    
    const processingFees = entries
      .filter(e => e.category === 'expense' && e.account.includes('Processing'))
      .reduce((sum, e) => sum + e.debit, 0);

    return {
      period: `${startDate} to ${endDate}`,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      eprFeeRevenue,
      processingFees,
      entries
    };
  }

  // Export methods for different accounting formats
  exportToQuickBooks(entries: AccountingEntry[]): string {
    // Generate QBO import format
    const header = 'Date,Description,Account,Debit,Credit,Reference\n';
    const rows = entries.map(entry => 
      `"${entry.date}","${entry.description}","${entry.account}",${entry.debit},${entry.credit},"${entry.reference}"`
    ).join('\n');
    
    return header + rows;
  }

  exportToXero(entries: AccountingEntry[]): string {
    // Generate Xero CSV format
    const header = '*Date,*AccountCode,Description,*TaxType,*GrossAmount,*Reference\n';
    const rows = entries.map(entry => {
      const amount = entry.debit || -entry.credit;
      return `"${entry.date}","${entry.account}","${entry.description}","Tax Exempt",${amount},"${entry.reference}"`;
    }).join('\n');
    
    return header + rows;
  }

  exportToSage(entries: AccountingEntry[]): any {
    // Generate Sage Intacct XML format
    return {
      transactions: entries.map(entry => ({
        date: entry.date,
        account: entry.account,
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        reference: entry.reference,
        category: entry.category
      }))
    };
  }
}

export const financialReportingService = new FinancialReportingService();
