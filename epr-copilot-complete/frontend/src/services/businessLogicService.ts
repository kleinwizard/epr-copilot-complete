/**
 * Centralized Business Logic Service
 * 
 * This service consolidates all business logic and calculations
 * to ensure consistency across the application.
 */

import { CalculationEngine, CalculationUtils } from './calculationEngine';
import { ValidationService } from './validationService';

export interface ObligationThresholds {
  jurisdiction: string;
  revenueThreshold?: number;
  tonnageThreshold?: number;
  logic: 'AND' | 'OR' | 'ALWAYS';
  modelType: string;
}

export interface ObligationResult {
  jurisdiction: string;
  isObligated: boolean;
  reason: string;
  thresholds: ObligationThresholds;
}

export interface ComplianceCalculation {
  score: number;
  grade: string;
  breakdown: Record<string, number>;
  recommendations: string[];
}

export class BusinessLogicService {
  
  /**
   * Jurisdiction obligation thresholds (centralized from specification)
   */
  private static readonly JURISDICTION_THRESHOLDS: Record<string, ObligationThresholds> = {
    'OR': {
      jurisdiction: 'Oregon',
      revenueThreshold: 5000000,
      tonnageThreshold: 1.0,
      logic: 'OR',
      modelType: 'PRO-led Fee System'
    },
    'CA': {
      jurisdiction: 'California',
      revenueThreshold: 1000000,
      tonnageThreshold: undefined,
      logic: 'OR',
      modelType: 'PRO-led Fee System'
    },
    'CO': {
      jurisdiction: 'Colorado',
      revenueThreshold: 5000000,
      tonnageThreshold: 1.0,
      logic: 'AND',
      modelType: 'Municipal Reimbursement'
    },
    'ME': {
      jurisdiction: 'Maine',
      revenueThreshold: 1000000,
      tonnageThreshold: 10.0,
      logic: 'OR',
      modelType: 'Full Municipal Reimbursement'
    },
    'MD': {
      jurisdiction: 'Maryland',
      revenueThreshold: 1000000,
      tonnageThreshold: undefined,
      logic: 'OR',
      modelType: 'Shared Responsibility'
    },
    'MN': {
      jurisdiction: 'Minnesota',
      revenueThreshold: 2000000,
      tonnageThreshold: undefined,
      logic: 'OR',
      modelType: 'Shared Responsibility'
    },
    'WA': {
      jurisdiction: 'Washington',
      revenueThreshold: 5000000,
      tonnageThreshold: undefined,
      logic: 'OR',
      modelType: 'Shared Responsibility'
    },
    'EU': {
      jurisdiction: 'European Union',
      revenueThreshold: undefined,
      tonnageThreshold: undefined,
      logic: 'ALWAYS',
      modelType: 'Extended Producer Responsibility'
    }
  };

  /**
   * Determine EPR obligation for a jurisdiction
   */
  static determineObligation(
    jurisdiction: string,
    annualRevenue: number,
    annualTonnage: number
  ): ObligationResult {
    const thresholds = this.JURISDICTION_THRESHOLDS[jurisdiction.toUpperCase()];
    
    if (!thresholds) {
      throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
    }

    let isObligated = false;
    let reason = '';

    switch (thresholds.logic) {
      case 'ALWAYS':
        isObligated = true;
        reason = 'All producers are obligated in this jurisdiction';
        break;
      
      case 'OR':
        const revenueExceeds = thresholds.revenueThreshold ? annualRevenue >= thresholds.revenueThreshold : false;
        const tonnageExceeds = thresholds.tonnageThreshold ? annualTonnage >= thresholds.tonnageThreshold : false;
        
        isObligated = revenueExceeds || tonnageExceeds;
        
        if (isObligated) {
          const reasons: string[] = [];
          if (revenueExceeds) reasons.push(`revenue ≥ $${thresholds.revenueThreshold?.toLocaleString()}`);
          if (tonnageExceeds) reasons.push(`tonnage ≥ ${thresholds.tonnageThreshold} tons`);
          reason = `Obligated: ${reasons.join(' OR ')}`;
        } else {
          reason = `Exempt: revenue < $${thresholds.revenueThreshold?.toLocaleString()} AND tonnage < ${thresholds.tonnageThreshold} tons`;
        }
        break;
      
      case 'AND':
        const revenueExceedsAnd = thresholds.revenueThreshold ? annualRevenue >= thresholds.revenueThreshold : true;
        const tonnageExceedsAnd = thresholds.tonnageThreshold ? annualTonnage >= thresholds.tonnageThreshold : true;
        
        isObligated = revenueExceedsAnd && tonnageExceedsAnd;
        
        if (isObligated) {
          reason = `Obligated: revenue ≥ $${thresholds.revenueThreshold?.toLocaleString()} AND tonnage ≥ ${thresholds.tonnageThreshold} tons`;
        } else {
          const failedConditions: string[] = [];
          if (!revenueExceedsAnd) failedConditions.push(`revenue < $${thresholds.revenueThreshold?.toLocaleString()}`);
          if (!tonnageExceedsAnd) failedConditions.push(`tonnage < ${thresholds.tonnageThreshold} tons`);
          reason = `Exempt: ${failedConditions.join(' OR ')}`;
        }
        break;
    }

    return {
      jurisdiction: thresholds.jurisdiction,
      isObligated,
      reason,
      thresholds
    };
  }

  /**
   * Calculate compliance score with business rules
   */
  static calculateComplianceScore(factors: {
    dataCompleteness: number;
    deadlineAdherence: number;
    materialClassification: number;
    documentationQuality: number;
    feePaymentStatus: number;
  }): ComplianceCalculation {
    const result = CalculationEngine.calculateComplianceScore(factors);
    
    const recommendations: string[] = [];
    
    if (factors.dataCompleteness < 80) {
      recommendations.push('Complete missing product and material data');
    }
    if (factors.deadlineAdherence < 90) {
      recommendations.push('Improve deadline adherence for submissions');
    }
    if (factors.materialClassification < 85) {
      recommendations.push('Review and improve material classification accuracy');
    }
    if (factors.documentationQuality < 75) {
      recommendations.push('Enhance documentation quality and completeness');
    }
    if (factors.feePaymentStatus < 95) {
      recommendations.push('Ensure timely fee payments');
    }

    return {
      ...result,
      recommendations
    };
  }

  /**
   * Calculate EPR fees with business rules
   */
  static calculateEPRFees(input: {
    materialType: string;
    weight: number;
    recyclabilityRate: number;
    baseRate: number;
    jurisdiction: string;
  }) {
    const validation = CalculationEngine.validateInputs(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    return CalculationEngine.calculateFees(input);
  }

  /**
   * Validate and process CSV import data
   */
  static validateCSVImport(data: any[], type: 'products' | 'materials'): {
    validRows: any[];
    invalidRows: Array<{ row: any; errors: string[]; rowNumber: number }>;
    summary: { total: number; valid: number; invalid: number };
  } {
    const validRows: any[] = [];
    const invalidRows: Array<{ row: any; errors: string[]; rowNumber: number }> = [];

    data.forEach((row, index) => {
      let validation;
      
      if (type === 'products') {
        validation = ValidationService.validateProduct(row);
      } else {
        validation = ValidationService.validateMaterial(row);
      }

      if (validation.isValid) {
        validRows.push(row);
      } else {
        invalidRows.push({
          row,
          errors: validation.errors,
          rowNumber: index + 1
        });
      }
    });

    return {
      validRows,
      invalidRows,
      summary: {
        total: data.length,
        valid: validRows.length,
        invalid: invalidRows.length
      }
    };
  }

  /**
   * Calculate financial projections with business logic
   */
  static calculateFinancialProjections(
    currentMonthFees: number,
    historicalData: number[],
    jurisdiction: string
  ) {
    const baseProjection = CalculationEngine.calculateFinancialProjections(currentMonthFees, historicalData);
    
    const thresholds = this.JURISDICTION_THRESHOLDS[jurisdiction.toUpperCase()];
    let adjustmentFactor = 1.0;
    
    if (thresholds?.modelType === 'PRO-led Fee System') {
      adjustmentFactor = 1.05; // 5% increase for PRO-led systems
    } else if (thresholds?.modelType === 'Municipal Reimbursement') {
      adjustmentFactor = 0.95; // 5% decrease for municipal systems
    }

    return {
      ...baseProjection,
      quarterlyProjection: CalculationUtils.roundToPrecision(baseProjection.quarterlyProjection * adjustmentFactor),
      yearlyProjection: CalculationUtils.roundToPrecision(baseProjection.yearlyProjection * adjustmentFactor),
      adjustmentFactor,
      jurisdictionModel: thresholds?.modelType || 'Unknown'
    };
  }

  /**
   * Get supported jurisdictions with their thresholds
   */
  static getSupportedJurisdictions(): ObligationThresholds[] {
    return Object.values(this.JURISDICTION_THRESHOLDS);
  }

  /**
   * Format currency values consistently
   */
  static formatCurrency(value: number, currency: string = 'USD'): string {
    return CalculationUtils.formatCurrency(value, currency);
  }

  /**
   * Calculate percentage change with business context
   */
  static calculatePercentageChange(oldValue: number, newValue: number): {
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    significance: 'minor' | 'moderate' | 'major';
  } {
    const percentage = CalculationUtils.calculatePercentageChange(oldValue, newValue);
    
    let trend: 'increasing' | 'decreasing' | 'stable';
    let significance: 'minor' | 'moderate' | 'major';
    
    if (Math.abs(percentage) < 5) {
      trend = 'stable';
      significance = 'minor';
    } else if (percentage > 0) {
      trend = 'increasing';
      significance = Math.abs(percentage) > 20 ? 'major' : 'moderate';
    } else {
      trend = 'decreasing';
      significance = Math.abs(percentage) > 20 ? 'major' : 'moderate';
    }

    return {
      percentage,
      trend,
      significance
    };
  }
}
