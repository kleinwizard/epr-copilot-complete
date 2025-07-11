/**
 * Centralized Calculation Engine for EPR Compliance
 * 
 * This module serves as the single source of truth for all mathematical
 * calculations and business logic in the EPR compliance application.
 * 
 * CRITICAL: All calculations must be 100% accurate, especially financial ones.
 * Any errors in these calculations could have severe consequences.
 */

import { API_CONFIG } from '@/config/api.config';
import { authService } from './authService';

export interface FeeCalculationInput {
  materialType: string;
  weight: number; // in kg
  recyclabilityRate: number; // 0-1
  baseRate: number; // per kg
  jurisdiction: string;
}

export interface EnhancedMaterial {
  type: string;
  weight: number;
  recyclable: boolean;
  postconsumerContent?: number;
  isReusable?: boolean;
  biodegradable?: boolean;
}

export interface MaterialFee {
  type: string;
  weight: number; // in grams
  recyclable: boolean;
  baseRate: number; // per kg
  adjustedRate: number; // after recyclability adjustment
  fee: number; // total fee for this material
}

export interface FeeCalculation {
  materials: MaterialFee[];
  totalWeight: number; // in grams
  totalFee: number;
  recyclabilityDiscount: number;
  breakdown: {
    baseFee: number;
    recyclabilityAdjustment: number;
    finalFee: number;
  };
}

export interface RegionalRates {
  region: string;
  baseRates: Record<string, number>;
  recyclabilityDiscount: number;
  postconsumerBonus: number;
  reusabilityDiscount: number;
}

export interface ComplianceResult {
  isCompliant: boolean;
  warnings: string[];
  recommendations: string[];
  requiredActions: string[];
}

export interface ProducerDataV1 {
  organization_id: string;
  annual_revenue: number;
  annual_tonnage: number;
  produces_perishable_food?: boolean;
  has_lca_disclosure?: boolean;
  has_environmental_impact_reduction?: boolean;
  uses_reusable_packaging?: boolean;
  annual_recycling_rates?: number[];
}

export interface PackagingComponentV1 {
  material_type: string;
  component_name: string;
  weight_per_unit: number;
  weight_unit: string;
  units_sold: number;
  recycled_content_percentage?: number;
  recyclable?: boolean;
  reusable?: boolean;
  disrupts_recycling?: boolean;
  recyclability_score?: number;
  contains_pfas?: boolean;
  contains_phthalates?: boolean;
  marine_degradable?: boolean;
  harmful_to_marine_life?: boolean;
  bay_friendly?: boolean;
  cold_weather_stable?: boolean;
}

export interface FeeCalculationRequestV1 {
  jurisdiction_code: string;
  producer_data: ProducerDataV1;
  packaging_data: PackagingComponentV1[];
  system_data?: any;
  calculation_date?: string;
  data_source?: string;
}

export interface FeeCalculationResponseV1 {
  calculation_id: string;
  jurisdiction: string;
  total_fee: number;
  currency: string;
  calculation_timestamp: string;
  calculation_breakdown: Record<string, any>;
  legal_citations: string[];
  compliance_status: string;
}

export interface RealTimeCalculationResult {
  totalFee: number;
  baseFee: number;
  discounts: number;
  breakdown: MaterialCalculation[];
  lastUpdated: string;
}

export interface MaterialCalculation {
  materialId: string;
  type: string;
  weight: number;
  fee: number;
  adjustedRate: number;
  recyclable: boolean;
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
 * Oregon EPR Rates - Single source of truth
 */
export const oregonEprRates = {
  'Paper (Label)': 0.12,
  'Paper (Corrugated)': 0.08,
  'Cardboard': 0.10,
  'Plastic (PET)': 0.45,
  'Plastic (HDPE)': 0.38,
  'Plastic (LDPE)': 0.62,
  'Plastic (PP)': 0.42,
  'Plastic (PS)': 0.78,
  'Plastic (Other)': 0.85,
  'Glass': 0.15,
  'Metal (Steel)': 0.22,
  'Metal (Aluminum)': 0.18,
} as const;

/**
 * Regional Rates Configuration
 */
export const regionalRates: Record<string, RegionalRates> = {
  oregon: {
    region: 'Oregon',
    baseRates: oregonEprRates,
    recyclabilityDiscount: 0.25,
    postconsumerBonus: 0.15,
    reusabilityDiscount: 0.30
  },
  california: {
    region: 'California',
    baseRates: {
      'Paper (Label)': 0.14,
      'Paper (Corrugated)': 0.10,
      'Cardboard': 0.12,
      'Plastic (PET)': 0.52,
      'Plastic (HDPE)': 0.45,
      'Plastic (LDPE)': 0.68,
      'Plastic (PP)': 0.48,
      'Plastic (PS)': 0.85,
      'Plastic (Other)': 0.92,
      'Glass': 0.18,
      'Metal (Steel)': 0.25,
      'Metal (Aluminum)': 0.20,
    },
    recyclabilityDiscount: 0.20,
    postconsumerBonus: 0.10,
    reusabilityDiscount: 0.25
  }
};

/**
 * Centralized Calculation Engine
 * All business logic and mathematical functions for the EPR application
 */
export class CalculationEngine {
  private static calculationCache: Map<string, RealTimeCalculationResult> = new Map();
  private static subscribers: Map<string, (result: RealTimeCalculationResult) => void> = new Map();
  private static debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
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
   * Calculate enhanced EPR fees with regional rates and eco-modulation
   */
  static calculateEnhancedEprFee(
    materials: EnhancedMaterial[],
    region: string = 'oregon',
    volume: number = 1
  ) {
    const rates = regionalRates[region] || regionalRates.oregon;
    
    const materialFees = materials.map(material => {
      const baseRate = rates.baseRates[material.type] || 0.50;
      let adjustedRate = baseRate;
      
      if (material.recyclable) {
        adjustedRate *= (1 - rates.recyclabilityDiscount);
      }
      
      if (material.postconsumerContent && material.postconsumerContent > 0.30) {
        adjustedRate *= (1 - rates.postconsumerBonus);
      }
      
      if (material.isReusable) {
        adjustedRate *= (1 - rates.reusabilityDiscount);
      }
      
      const weightInKg = material.weight / 1000;
      const fee = weightInKg * adjustedRate * volume;
      
      return {
        ...material,
        baseRate,
        adjustedRate,
        fee,
        volumeMultiplier: volume
      };
    });
    
    const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);
    const baseFee = materialFees.reduce((sum, m) => sum + (m.weight / 1000 * m.baseRate * volume), 0);
    const totalFee = materialFees.reduce((sum, m) => sum + m.fee, 0);
    const totalDiscount = baseFee - totalFee;
    
    return {
      materials: materialFees,
      totalWeight,
      volume,
      baseFee,
      totalFee,
      totalDiscount,
      region: rates.region,
      breakdown: {
        recyclabilityDiscount: totalDiscount,
        finalFee: totalFee
      }
    };
  }

  /**
   * Real-time fee calculation with caching and debouncing
   */
  static calculateRealTimeFees(
    productId: string,
    materials: EnhancedMaterial[],
    volume: number = 1,
    region: string = 'oregon'
  ): RealTimeCalculationResult {
    const cacheKey = this.generateCacheKey(productId, materials, volume, region);
    
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const calculation = this.calculateEnhancedEprFee(materials, region, volume);
    
    const result: RealTimeCalculationResult = {
      totalFee: calculation.totalFee,
      baseFee: calculation.baseFee,
      discounts: calculation.totalDiscount,
      breakdown: calculation.materials.map((material, index) => ({
        materialId: `${productId}-${index}`,
        type: material.type,
        weight: material.weight,
        fee: material.fee,
        adjustedRate: material.adjustedRate,
        recyclable: material.recyclable
      })),
      lastUpdated: new Date().toISOString()
    };

    this.calculationCache.set(cacheKey, result);
    this.notifySubscribers(productId, result);
    
    return result;
  }

  /**
   * Calculate fees with debouncing for real-time updates
   */
  static calculateFeesWithDebounce(
    productId: string,
    materials: EnhancedMaterial[],
    volume: number = 1,
    region: string = 'oregon',
    debounceMs: number = 300
  ): Promise<RealTimeCalculationResult> {
    return new Promise((resolve) => {
      const existingTimer = this.debounceTimers.get(productId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        const result = this.calculateRealTimeFees(productId, materials, volume, region);
        resolve(result);
        this.debounceTimers.delete(productId);
      }, debounceMs);

      this.debounceTimers.set(productId, timer);
    });
  }

  /**
   * API-based EPR fee calculation (legacy support)
   */
  static async calculateEprFee(materials: Array<{
    type: string;
    weight: number;
    recyclable: boolean;
  }>): Promise<FeeCalculation> {
    const token = authService.getAccessToken();
    const API_BASE_URL = API_CONFIG.getBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/fees/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ materials }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate fees');
    }

    const result = await response.json();
    
    const materialFees: MaterialFee[] = result.materials.map((m: any) => ({
      type: m.type,
      weight: m.weight,
      recyclable: m.recyclable,
      baseRate: m.base_rate,
      adjustedRate: m.adjusted_rate,
      fee: m.fee
    }));

    return {
      materials: materialFees,
      totalWeight: result.total_weight,
      totalFee: result.total_fee,
      recyclabilityDiscount: result.recyclability_discount,
      breakdown: {
        baseFee: result.breakdown.base_fee,
        recyclabilityAdjustment: result.breakdown.recyclability_adjustment,
        finalFee: result.breakdown.final_fee
      }
    };
  }

  /**
   * V1 API-based EPR fee calculation
   */
  static async calculateEprFeeV1(request: FeeCalculationRequestV1): Promise<FeeCalculationResponseV1> {
    const token = authService.getAccessToken();
    const API_BASE_URL = API_CONFIG.getBaseUrl();
    const response = await fetch(`${API_BASE_URL}/api/fees/v1/calculate-fee`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to calculate EPR fees');
    }

    return response.json();
  }

  /**
   * Validate product compliance
   */
  static validateProductCompliance(
    materials: EnhancedMaterial[],
    region: string = 'oregon'
  ): ComplianceResult {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];
    
    const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);
    const recyclableWeight = materials.filter(m => m.recyclable).reduce((sum, m) => sum + m.weight, 0);
    const recyclabilityRate = recyclableWeight / totalWeight;
    
    if (recyclabilityRate < 0.50) {
      warnings.push('Product recyclability is below 50% - consider material alternatives');
      recommendations.push('Explore more recyclable material options');
    }
    
    if (recyclabilityRate < 0.30) {
      requiredActions.push('Product does not meet minimum recyclability requirements');
    }
    
    const problematicMaterials = materials.filter(m => 
      m.type.includes('PS') || m.type.includes('Other')
    );
    
    if (problematicMaterials.length > 0) {
      warnings.push('Contains materials with limited recycling infrastructure');
      recommendations.push('Consider alternatives to polystyrene and mixed plastics');
    }
    
    const materialTypes = [...new Set(materials.map(m => m.type))];
    if (materialTypes.length > 3) {
      warnings.push('High material diversity may complicate recycling');
      recommendations.push('Simplify packaging design to use fewer material types');
    }
    
    const isCompliant = requiredActions.length === 0;
    
    return {
      isCompliant,
      warnings,
      recommendations,
      requiredActions
    };
  }

  /**
   * Generate compliance suggestions
   */
  static generateComplianceSuggestions(materials: EnhancedMaterial[]): string[] {
    const suggestions: string[] = [];
    
    materials.forEach(material => {
      if (!material.recyclable && material.weight > 100) {
        suggestions.push(`Consider replacing ${material.type} with recyclable alternative`);
      }
      
      if (material.type.includes('Plastic') && !material.postconsumerContent) {
        suggestions.push(`Add post-consumer recycled content to ${material.type}`);
      }
      
      if (material.weight > 500 && !material.isReusable) {
        suggestions.push(`Explore reusable packaging options for ${material.type}`);
      }
    });
    
    return suggestions;
  }

  /**
   * Subscribe to real-time calculation updates
   */
  static subscribe(productId: string, callback: (result: RealTimeCalculationResult) => void) {
    this.subscribers.set(productId, callback);
    
    return () => {
      this.subscribers.delete(productId);
    };
  }

  /**
   * Clear calculation cache
   */
  static clearCache(productId?: string) {
    if (productId) {
      for (const key of this.calculationCache.keys()) {
        if (key.startsWith(productId)) {
          this.calculationCache.delete(key);
        }
      }
    } else {
      this.calculationCache.clear();
    }
  }

  /**
   * Convert materials to V1 format
   */
  static convertMaterialsToV1Format(
    materials: Array<{ type: string; weight: number; recyclable: boolean; }>,
    unitsPerProduct: number = 1
  ): PackagingComponentV1[] {
    return materials.map((material, index) => ({
      material_type: material.type,
      component_name: `Component ${index + 1}`,
      weight_per_unit: material.weight / 1000,
      weight_unit: 'kg',
      units_sold: unitsPerProduct,
      recycled_content_percentage: 0,
      recyclable: material.recyclable,
      reusable: false,
      disrupts_recycling: false,
      recyclability_score: material.recyclable ? 75 : 25,
      contains_pfas: false,
      contains_phthalates: false,
      marine_degradable: false,
      harmful_to_marine_life: false,
      bay_friendly: false,
      cold_weather_stable: true
    }));
  }

  /**
   * Get supported jurisdictions
   */
  static async getSupportedJurisdictions(): Promise<Array<{code: string, name: string, model_type: string}>> {
    const response = await fetch(API_CONFIG.getApiUrl('/fees/jurisdictions'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supported jurisdictions');
    }

    return response.json();
  }

  /**
   * Generate cache key for calculations
   */
  private static generateCacheKey(productId: string, materials: EnhancedMaterial[], volume: number, region: string): string {
    const materialHash = materials
      .map(m => `${m.type}-${m.weight}-${m.recyclable}-${m.postconsumerContent || 0}`)
      .join('|');
    return `${productId}-${volume}-${region}-${materialHash}`;
  }

  /**
   * Notify subscribers of calculation updates
   */
  private static notifySubscribers(productId: string, result: RealTimeCalculationResult) {
    const callback = this.subscribers.get(productId);
    if (callback) {
      callback(result);
    }
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
