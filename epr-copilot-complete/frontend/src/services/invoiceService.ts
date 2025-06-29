
import { Invoice } from '../types/payment';
import { RealTimeCalculationResult } from './realTimeFeeCalculation';

export class InvoiceService {
  private invoices: Map<string, Invoice> = new Map();

  generateInvoice(
    customerId: string,
    feeCalculation: RealTimeCalculationResult,
    paymentIntentId?: string
  ): Invoice {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = `EPR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const invoice: Invoice = {
      id,
      invoiceNumber,
      customerId,
      amount: feeCalculation.totalFee,
      currency: 'usd',
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      issuedDate: new Date().toISOString(),
      feeCalculation,
      paymentIntentId,
      metadata: {
        generatedBy: 'EPR Fee Calculator',
        region: 'oregon', // Could be dynamic
        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        year: new Date().getFullYear().toString()
      }
    };

    this.invoices.set(id, invoice);
    return invoice;
  }

  getInvoice(invoiceId: string): Invoice | null {
    return this.invoices.get(invoiceId) || null;
  }

  getInvoicesByCustomer(customerId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(inv => inv.customerId === customerId);
  }

  updateInvoiceStatus(invoiceId: string, status: Invoice['status'], paidDate?: string): boolean {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return false;

    const updatedInvoice = {
      ...invoice,
      status,
      paidDate: status === 'paid' ? (paidDate || new Date().toISOString()) : invoice.paidDate
    };

    this.invoices.set(invoiceId, updatedInvoice);
    return true;
  }
}

export const invoiceService = new InvoiceService();
