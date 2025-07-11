
import { PaymentMethod, PaymentIntent, Invoice, PaymentHistory } from '../types/payment';
import { RealTimeCalculationResult } from './calculationEngine';
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
  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return paymentMethodsService.addPaymentMethod(method);
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return paymentMethodsService.getPaymentMethods();
  }

  async getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
    return await paymentMethodsService.getDefaultPaymentMethod();
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean> {
    return await paymentMethodsService.setDefaultPaymentMethod(paymentMethodId);
  }

  async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    return await paymentMethodsService.removePaymentMethod(paymentMethodId);
  }

  // Payment Intent Management - delegate to paymentIntentsService
  async createPaymentIntent(
    feeCalculation: RealTimeCalculationResult,
    paymentMethodId: string,
    description: string = 'EPR Fee Payment'
  ): Promise<PaymentIntent> {
    return paymentIntentsService.createPaymentIntent(feeCalculation, paymentMethodId, description);
  }

  async processPayment(paymentIntentId: string): Promise<PaymentIntent> {
    return paymentIntentsService.processPayment(paymentIntentId);
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    return await paymentIntentsService.getPaymentIntent(paymentIntentId);
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
