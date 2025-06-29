
import { AccountingEntry } from '../types/financialIntegrations';

export class AccountingEntriesService {
  private accountingEntries: Map<string, AccountingEntry> = new Map();

  createAccountingEntry(entry: Omit<AccountingEntry, 'id'>): AccountingEntry {
    const id = `ae_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accountingEntry: AccountingEntry = { ...entry, id };
    this.accountingEntries.set(id, accountingEntry);
    return accountingEntry;
  }

  getAccountingEntries(startDate?: string, endDate?: string): AccountingEntry[] {
    const entries = Array.from(this.accountingEntries.values());
    
    if (!startDate && !endDate) return entries;
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return entryDate >= start && entryDate <= end;
    });
  }

  // Invoice to Accounting Entry Conversion
  convertInvoiceToAccountingEntries(
    invoice: any,
    receivableAccount: string = '1200 - Accounts Receivable',
    revenueAccount: string = '4000 - EPR Fee Revenue'
  ): AccountingEntry[] {
    const entries: AccountingEntry[] = [];

    // Debit Accounts Receivable
    entries.push(this.createAccountingEntry({
      date: invoice.issuedDate,
      description: `EPR Fee Invoice ${invoice.invoiceNumber}`,
      account: receivableAccount,
      debit: invoice.amount,
      credit: 0,
      reference: invoice.invoiceNumber,
      category: 'asset'
    }));

    // Credit Revenue
    entries.push(this.createAccountingEntry({
      date: invoice.issuedDate,
      description: `EPR Fee Revenue ${invoice.invoiceNumber}`,
      account: revenueAccount,
      debit: 0,
      credit: invoice.amount,
      reference: invoice.invoiceNumber,
      category: 'revenue'
    }));

    return entries;
  }

  // Payment to Accounting Entry Conversion
  convertPaymentToAccountingEntries(
    payment: any,
    cashAccount: string = '1000 - Cash',
    receivableAccount: string = '1200 - Accounts Receivable',
    feeExpenseAccount: string = '5000 - Payment Processing Fees'
  ): AccountingEntry[] {
    const entries: AccountingEntry[] = [];

    // Debit Cash (net amount)
    entries.push(this.createAccountingEntry({
      date: payment.paymentDate,
      description: `Payment received ${payment.transactionId}`,
      account: cashAccount,
      debit: payment.netAmount,
      credit: 0,
      reference: payment.transactionId,
      category: 'asset'
    }));

    // Debit Processing Fees
    if (payment.fees > 0) {
      entries.push(this.createAccountingEntry({
        date: payment.paymentDate,
        description: `Payment processing fee ${payment.transactionId}`,
        account: feeExpenseAccount,
        debit: payment.fees,
        credit: 0,
        reference: payment.transactionId,
        category: 'expense'
      }));
    }

    // Credit Accounts Receivable
    entries.push(this.createAccountingEntry({
      date: payment.paymentDate,
      description: `Payment applied ${payment.transactionId}`,
      account: receivableAccount,
      debit: 0,
      credit: payment.amount,
      reference: payment.transactionId,
      category: 'asset'
    }));

    return entries;
  }
}

export const accountingEntriesService = new AccountingEntriesService();
