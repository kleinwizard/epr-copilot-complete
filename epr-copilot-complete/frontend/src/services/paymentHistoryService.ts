
import { PaymentHistory, PaymentMethod, Invoice } from '../types/payment';

export class PaymentHistoryService {
  private paymentHistory: Map<string, PaymentHistory> = new Map();
  private invoices: Map<string, Invoice> = new Map();

  // Set invoices reference for validation
  setInvoicesReference(invoices: Map<string, Invoice>) {
    this.invoices = invoices;
  }

  recordPayment(
    invoiceId: string,
    paymentMethod: PaymentMethod,
    transactionId: string,
    fees: number = 0
  ): PaymentHistory {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const id = `ph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment: PaymentHistory = {
      id,
      invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      status: 'completed',
      paymentDate: new Date().toISOString(),
      paymentMethod,
      transactionId,
      fees,
      netAmount: invoice.amount - fees
    };

    this.paymentHistory.set(id, payment);
    return payment;
  }

  getPaymentHistory(customerId?: string): PaymentHistory[] {
    const payments = Array.from(this.paymentHistory.values());
    
    if (!customerId) return payments;
    
    return payments.filter(payment => {
      const invoice = this.invoices.get(payment.invoiceId);
      return invoice?.customerId === customerId;
    });
  }
}

export const paymentHistoryService = new PaymentHistoryService();
