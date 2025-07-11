
import { RealTimeCalculationResult } from '../services/calculationEngine';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'ach' | 'wire';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  feeCalculationId: string;
  paymentMethodId: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  feeCalculation: RealTimeCalculationResult;
  paymentIntentId?: string;
  metadata: Record<string, string>;
}

export interface PaymentHistory {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  fees: number;
  netAmount: number;
}
