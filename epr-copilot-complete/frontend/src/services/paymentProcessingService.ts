
import { PaymentMethod, PaymentIntent, Invoice, PaymentHistory } from '../types/payment';
import { RealTimeCalculationResult } from './realTimeFeeCalculation';
import { paymentMethodsService } from './paymentMethodsService';
import { paymentIntentsService } from './paymentIntentsService';
import { invoiceService } from './invoiceService';
import { paymentHistoryService } from './paymentHistoryService';
import { paymentReportsService } from './paymentReportsService';

export class PaymentProcessingService {
  constructor() {
    // Set up cross-service references
    paymentHistoryService.setInvoicesReference(invoiceService['invoices']);
  }

  // Payment Methods Management - delegate to paymentMethodsService
  addPaymentMethod(method: Omit<PaymentMethod, 'id'>): PaymentMethod {
    return paymentMethodsService.addPaymentMethod(method);
  }

  getPaymentMethods(): PaymentMethod[] {
    return paymentMethodsService.getPaymentMethods();
  }

  getDefaultPaymentMethod(): PaymentMethod | null {
    return paymentMethodsService.getDefaultPaymentMethod();
  }

  setDefaultPaymentMethod(paymentMethodId: string): boolean {
    return paymentMethodsService.setDefaultPaymentMethod(paymentMethodId);
  }

  removePaymentMethod(paymentMethodId: string): boolean {
    return paymentMethodsService.removePaymentMethod(paymentMethodId);
  }

  // Payment Intent Management - delegate to paymentIntentsService
  createPaymentIntent(
    feeCalculation: RealTimeCalculationResult,
    paymentMethodId: string,
    description: string = 'EPR Fee Payment'
  ): PaymentIntent {
    return paymentIntentsService.createPaymentIntent(feeCalculation, paymentMethodId, description);
  }

  async processPayment(paymentIntentId: string): Promise<PaymentIntent> {
    return paymentIntentsService.processPayment(paymentIntentId);
  }

  getPaymentIntent(paymentIntentId: string): PaymentIntent | null {
    return paymentIntentsService.getPaymentIntent(paymentIntentId);
  }

  // Invoice Management - delegate to invoiceService
  generateInvoice(
    customerId: string,
    feeCalculation: RealTimeCalculationResult,
    paymentIntentId?: string
  ): Invoice {
    return invoiceService.generateInvoice(customerId, feeCalculation, paymentIntentId);
  }

  getInvoice(invoiceId: string): Invoice | null {
    return invoiceService.getInvoice(invoiceId);
  }

  getInvoicesByCustomer(customerId: string): Invoice[] {
    return invoiceService.getInvoicesByCustomer(customerId);
  }

  updateInvoiceStatus(invoiceId: string, status: Invoice['status'], paidDate?: string): boolean {
    const result = invoiceService.updateInvoiceStatus(invoiceId, status, paidDate);
    // Update reference for payment history service
    paymentHistoryService.setInvoicesReference(invoiceService['invoices']);
    return result;
  }

  // Payment History - delegate to paymentHistoryService
  recordPayment(
    invoiceId: string,
    paymentMethod: PaymentMethod,
    transactionId: string,
    fees: number = 0
  ): PaymentHistory {
    const payment = paymentHistoryService.recordPayment(invoiceId, paymentMethod, transactionId, fees);
    this.updateInvoiceStatus(invoiceId, 'paid');
    return payment;
  }

  getPaymentHistory(customerId?: string): PaymentHistory[] {
    return paymentHistoryService.getPaymentHistory(customerId);
  }

  // Financial Reports - delegate to paymentReportsService
  getPaymentSummary(startDate?: string, endDate?: string) {
    const payments = this.getPaymentHistory();
    return paymentReportsService.getPaymentSummary(payments, startDate, endDate);
  }
}

export const paymentProcessingService = new PaymentProcessingService();

// Re-export types for backward compatibility
export type { PaymentMethod, PaymentIntent, Invoice, PaymentHistory };
