
import { PaymentMethod } from '../types/payment';

export class PaymentMethodsService {
  private paymentMethods: Map<string, PaymentMethod> = new Map();

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('https://app-gqghzcxc.fly.dev/api/payments/save-payment-method', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: method.type + '_' + Date.now(),
          save_for_future: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add payment method');
      }
      
      const result = await response.json();
      const paymentMethod: PaymentMethod = {
        ...method,
        id: result.payment_method_id,
        isDefault: this.paymentMethods.size === 0
      };
      
      this.paymentMethods.set(paymentMethod.id, paymentMethod);
      return paymentMethod;
    } catch (error) {
      const id = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const paymentMethod: PaymentMethod = { ...method, id };
      
      if (this.paymentMethods.size === 0) {
        paymentMethod.isDefault = true;
      }
      
      this.paymentMethods.set(id, paymentMethod);
      return paymentMethod;
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('https://app-gqghzcxc.fly.dev/api/payments/payment-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const result = await response.json();
      return result.payment_methods || Array.from(this.paymentMethods.values());
    } catch (error) {
      return Array.from(this.paymentMethods.values());
    }
  }

  getDefaultPaymentMethod(): PaymentMethod | null {
    return Array.from(this.paymentMethods.values()).find(pm => pm.isDefault) || null;
  }

  setDefaultPaymentMethod(paymentMethodId: string): boolean {
    const method = this.paymentMethods.get(paymentMethodId);
    if (!method) return false;
    
    // Remove default from all methods
    for (const [key, pm] of this.paymentMethods.entries()) {
      this.paymentMethods.set(key, { ...pm, isDefault: false });
    }
    
    // Set new default
    this.paymentMethods.set(paymentMethodId, { ...method, isDefault: true });
    return true;
  }

  removePaymentMethod(paymentMethodId: string): boolean {
    const method = this.paymentMethods.get(paymentMethodId);
    if (!method) return false;
    
    this.paymentMethods.delete(paymentMethodId);
    
    // If removed method was default, set another as default
    if (method.isDefault && this.paymentMethods.size > 0) {
      const firstMethod = this.paymentMethods.values().next().value;
      if (firstMethod) {
        this.paymentMethods.set(firstMethod.id, { ...firstMethod, isDefault: true });
      }
    }
    
    return true;
  }
}

export const paymentMethodsService = new PaymentMethodsService();
