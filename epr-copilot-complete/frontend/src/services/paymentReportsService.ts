
import { PaymentHistory } from '../types/payment';

export class PaymentReportsService {
  getPaymentSummary(payments: PaymentHistory[], startDate?: string, endDate?: string) {
    const filteredPayments = payments.filter(payment => {
      if (!startDate && !endDate) return true;
      const paymentDate = new Date(payment.paymentDate);
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      return paymentDate >= start && paymentDate <= end;
    });

    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = filteredPayments.reduce((sum, p) => sum + p.fees, 0);
    const netAmount = filteredPayments.reduce((sum, p) => sum + p.netAmount, 0);
    
    return {
      totalPayments: filteredPayments.length,
      totalAmount,
      totalFees,
      netAmount,
      averagePayment: filteredPayments.length > 0 ? totalAmount / filteredPayments.length : 0,
      paymentsByMethod: this.groupPaymentsByMethod(filteredPayments),
      monthlyBreakdown: this.getMonthlyBreakdown(filteredPayments)
    };
  }

  private groupPaymentsByMethod(payments: PaymentHistory[]) {
    const grouped = new Map<string, { count: number; amount: number }>();
    
    payments.forEach(payment => {
      const key = payment.paymentMethod.type;
      const existing = grouped.get(key) || { count: 0, amount: 0 };
      grouped.set(key, {
        count: existing.count + 1,
        amount: existing.amount + payment.amount
      });
    });
    
    return Object.fromEntries(grouped);
  }

  private getMonthlyBreakdown(payments: PaymentHistory[]) {
    const monthly = new Map<string, { count: number; amount: number }>();
    
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = monthly.get(key) || { count: 0, amount: 0 };
      monthly.set(key, {
        count: existing.count + 1,
        amount: existing.amount + payment.amount
      });
    });
    
    return Object.fromEntries(monthly);
  }
}

export const paymentReportsService = new PaymentReportsService();
