
import { PaymentIntent } from '../types/payment';
import { RealTimeCalculationResult } from './realTimeFeeCalculation';

export class PaymentIntentsService {
  private paymentIntents: Map<string, PaymentIntent> = new Map();

  async createPaymentIntent(
    feeCalculation: RealTimeCalculationResult,
    paymentMethodId: string,
    description: string = 'EPR Fee Payment'
  ): Promise<PaymentIntent> {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://app-gqghzcxc.fly.dev'}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(feeCalculation.totalFee * 100), // Convert to cents
          currency: 'usd',
          description
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const result = await response.json();
      const paymentIntent: PaymentIntent = {
        id: result.payment_intent_id,
        amount: result.amount,
        currency: result.currency,
        status: result.status,
        feeCalculationId: feeCalculation.lastUpdated,
        paymentMethodId,
        description,
        metadata: {
          productId: feeCalculation.breakdown[0]?.materialId.split('-')[0] || 'unknown',
          materialCount: feeCalculation.breakdown.length.toString(),
          baseFee: feeCalculation.baseFee.toString(),
          discounts: feeCalculation.discounts.toString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.paymentIntents.set(paymentIntent.id, paymentIntent);
      return paymentIntent;
    } catch (error) {
      const id = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const paymentIntent: PaymentIntent = {
        id,
        amount: Math.round(feeCalculation.totalFee * 100),
        currency: 'usd',
        status: 'pending',
        feeCalculationId: feeCalculation.lastUpdated,
        paymentMethodId,
        description,
        metadata: {
          productId: feeCalculation.breakdown[0]?.materialId.split('-')[0] || 'unknown',
          materialCount: feeCalculation.breakdown.length.toString(),
          baseFee: feeCalculation.baseFee.toString(),
          discounts: feeCalculation.discounts.toString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.paymentIntents.set(id, paymentIntent);
      return paymentIntent;
    }
  }

  async processPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const intent = this.paymentIntents.get(paymentIntentId);
    if (!intent) {
      throw new Error('Payment intent not found');
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://app-gqghzcxc.fly.dev'}/api/payments/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: intent.paymentMethodId,
          save_for_future: false
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process payment');
      }
      
      const result = await response.json();
      const updatedIntent = {
        ...intent,
        status: result.status as 'succeeded' | 'failed' | 'processing',
        updatedAt: new Date().toISOString()
      };
      
      this.paymentIntents.set(paymentIntentId, updatedIntent);
      return updatedIntent;
    } catch (error) {
      const updatedIntent = {
        ...intent,
        status: 'processing' as const,
        updatedAt: new Date().toISOString()
      };
      
      this.paymentIntents.set(paymentIntentId, updatedIntent);

      const finalIntent = {
        ...updatedIntent,
        status: 'failed' as const,
        updatedAt: new Date().toISOString()
      };
      this.paymentIntents.set(paymentIntentId, finalIntent);

      return updatedIntent;
    }
  }

  getPaymentIntent(paymentIntentId: string): PaymentIntent | null {
    return this.paymentIntents.get(paymentIntentId) || null;
  }
}

export const paymentIntentsService = new PaymentIntentsService();
