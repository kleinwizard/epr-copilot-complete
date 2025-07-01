/**
 * Centralized Calculation Engine for EPR Compliance
 * 
 * This module serves as the single source of truth for all mathematical
 * calculations and business logic in the EPR compliance application.
 * 
 * CRITICAL: All calculations must be 100% accurate, especially financial ones.
 * Any errors in these calculations could have severe consequences.
 */

export interface FeeCalculationInput {
  materialType: string;
  weight: number; // in kg
  recyclabilityRate: number; // 0-1
  baseRate: number; // per kg
  jurisdiction: string;
}

export interface YTDCalculationOptions {
  yearType: 'calendar' | 'fiscal';
  fiscalYearStart?: number; // month (1-12), defaults to 4 (April) if not specified
}

export interface ComplianceScoreFactors {
  dataCompleteness: number; // 0-100
  deadlineAdherence: number; // 0-100
  materialClassification: number; // 0-100
  documentationQuality: number; // 0-100
  feePaymentStatus: number; // 0-100
}

export interface ProductData {
  id: string;
  materialType: string;
  weight: number;
  isActive: boolean;
  createdAt: Date;
}

export interface FeeRecord {
  amount: number;
  paidAt: Date;
  period: string;
}

export interface MessageData {
  id: string;
  timestamp: Date;
  type: 'sent' | 'received';
}

/**
 * Centralized Calculation Engine
 * All business logic and mathematical functions for the EPR application
 */
export class CalculationEngine {
  
  /**
   * Calculate EPR fees with volume discounts
   * Volume discount: 5% for weights ≥ 1000kg (matches backend logic)
   */
  static calculateFees(input: FeeCalculationInput): {
    baseFee: number;
    discount: number;
    finalFee: number;
    discountApplied: boolean;
  } {
    const weight = Math.round(input.weight * 100) / 100;
    const baseRate = Math.round(input.baseRate * 10000) / 10000;
    
    const baseFee = Math.round(weight * baseRate * 100) / 100;
    
    const discountApplied = weight >= 1000;
    const discountRate = discountApplied ? 0.05 : 0;
    const discount = Math.round(baseFee * discountRate * 100) / 100;
    const finalFee = Math.round((baseFee - discount) * 100) / 100;
    
    return {
      baseFee,
      discount,
      finalFee,
      discountApplied
    };
  }

  /**
   * Calculate Year-to-Date fees with both calendar and fiscal year options
   */
  static calculateYTDFees(
    feeRecords: FeeRecord[], 
    options: YTDCalculationOptions = { yearType: 'calendar' }
  ): {
    calendarYTD: number;
    fiscalYTD: number;
    currentPeriod: string;
  } {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const calendarYearStart = new Date(currentYear, 0, 1);
    const calendarYTD = feeRecords
      .filter(record => record.paidAt >= calendarYearStart && record.paidAt <= now)
      .reduce((sum, record) => sum + record.amount, 0);

    const fiscalYearStartMonth = (options.fiscalYearStart || 4) - 1; // Convert to 0-based
    let fiscalYearStart: Date;
    
    if (now.getMonth() >= fiscalYearStartMonth) {
      fiscalYearStart = new Date(currentYear, fiscalYearStartMonth, 1);
    } else {
      fiscalYearStart = new Date(currentYear - 1, fiscalYearStartMonth, 1);
    }
    
    const fiscalYTD = feeRecords
      .filter(record => record.paidAt >= fiscalYearStart && record.paidAt <= now)
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      calendarYTD: Math.round(calendarYTD * 100) / 100,
      fiscalYTD: Math.round(fiscalYTD * 100) / 100,
      currentPeriod: options.yearType === 'fiscal' ? 'fiscal' : 'calendar'
    };
  }

  /**
   * Calculate compliance score with weighted factors
   * Weights: Data Completeness (25%), Deadline Adherence (30%), 
   * Material Classification (20%), Documentation Quality (15%), Fee Payment Status (10%)
   */
  static calculateComplianceScore(factors: ComplianceScoreFactors): {
    score: number;
    grade: string;
    breakdown: Record<string, number>;
  } {
    const normalized = {
      dataCompleteness: Math.max(0, Math.min(100, factors.dataCompleteness)) / 100,
      deadlineAdherence: Math.max(0, Math.min(100, factors.deadlineAdherence)) / 100,
      materialClassification: Math.max(0, Math.min(100, factors.materialClassification)) / 100,
      documentationQuality: Math.max(0, Math.min(100, factors.documentationQuality)) / 100,
      feePaymentStatus: Math.max(0, Math.min(100, factors.feePaymentStatus)) / 100
    };

    const weightedScore = 
      normalized.dataCompleteness * 0.25 +
      normalized.deadlineAdherence * 0.30 +
      normalized.materialClassification * 0.20 +
      normalized.documentationQuality * 0.15 +
      normalized.feePaymentStatus * 0.10;

    const score = Math.round(weightedScore * 100);
    
    let grade: string;
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      score,
      grade,
      breakdown: {
        dataCompleteness: Math.round(normalized.dataCompleteness * 25),
        deadlineAdherence: Math.round(normalized.deadlineAdherence * 30),
        materialClassification: Math.round(normalized.materialClassification * 20),
        documentationQuality: Math.round(normalized.documentationQuality * 15),
        feePaymentStatus: Math.round(normalized.feePaymentStatus * 10)
      }
    };
  }

  /**
   * Calculate total active products
   */
  static calculateTotalActiveProducts(products: ProductData[]): number {
    return products.filter(product => product.isActive).length;
  }

  /**
   * Calculate total message counts
   */
  static calculateMessageCounts(messages: MessageData[]): {
    total: number;
    sent: number;
    received: number;
    today: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sent = messages.filter(m => m.type === 'sent').length;
    const received = messages.filter(m => m.type === 'received').length;
    const todayMessages = messages.filter(m => 
      m.timestamp >= today && m.timestamp < tomorrow
    ).length;

    return {
      total: messages.length,
      sent,
      received,
      today: todayMessages
    };
  }

  /**
   * Calculate financial projections
   */
  static calculateFinancialProjections(
    currentMonthFees: number,
    historicalData: number[]
  ): {
    quarterlyProjection: number;
    yearlyProjection: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const quarterlyProjection = Math.round(currentMonthFees * 3 * 100) / 100;
    
    const yearlyProjection = Math.round(currentMonthFees * 12 * 100) / 100;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (historicalData.length >= 2) {
      const recent = historicalData.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const older = historicalData.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
      
      if (recent > older * 1.05) trend = 'increasing';
      else if (recent < older * 0.95) trend = 'decreasing';
    }

    return {
      quarterlyProjection,
      yearlyProjection,
      trend
    };
  }

  /**
   * Calculate analytics data breakdowns
   */
  static calculateAnalyticsBreakdown(
    products: ProductData[],
    feeRecords: FeeRecord[]
  ): {
    materialTypeBreakdown: Record<string, number>;
    monthlyFeeBreakdown: Record<string, number>;
    weightDistribution: Record<string, number>;
  } {
    const materialTypeBreakdown: Record<string, number> = {};
    products.forEach(product => {
      materialTypeBreakdown[product.materialType] = 
        (materialTypeBreakdown[product.materialType] || 0) + 1;
    });

    const monthlyFeeBreakdown: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
      monthlyFeeBreakdown[monthKey] = 0;
    }
    
    feeRecords.forEach(record => {
      const monthKey = record.paidAt.toISOString().slice(0, 7);
      if (monthlyFeeBreakdown.hasOwnProperty(monthKey)) {
        monthlyFeeBreakdown[monthKey] += record.amount;
      }
    });

    const weightDistribution: Record<string, number> = {
      'light': 0,    // < 100kg
      'medium': 0,   // 100-1000kg
      'heavy': 0     // > 1000kg
    };
    
    products.forEach(product => {
      if (product.weight < 100) weightDistribution.light++;
      else if (product.weight <= 1000) weightDistribution.medium++;
      else weightDistribution.heavy++;
    });

    return {
      materialTypeBreakdown,
      monthlyFeeBreakdown,
      weightDistribution
    };
  }

  /**
   * Validate calculation inputs to prevent errors
   */
  static validateInputs(input: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof input.weight !== 'number' || input.weight < 0) {
      errors.push('Weight must be a positive number');
    }

    if (typeof input.baseRate !== 'number' || input.baseRate < 0) {
      errors.push('Base rate must be a positive number');
    }

    if (input.recyclabilityRate !== undefined && 
        (typeof input.recyclabilityRate !== 'number' || 
         input.recyclabilityRate < 0 || input.recyclabilityRate > 1)) {
      errors.push('Recyclability rate must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Utility functions for common calculations
 */
export const CalculationUtils = {
  /**
   * Round to specified decimal places for financial precision
   */
  roundToPrecision: (value: number, decimals: number = 2): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  /**
   * Format currency values
   */
  formatCurrency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Math.round(((newValue - oldValue) / oldValue) * 100 * 100) / 100;
  }
};
