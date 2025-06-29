
import { calculateEnhancedEprFee, EnhancedMaterial } from './enhancedFeeCalculation';

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

export class RealTimeFeeCalculationEngine {
  private calculationCache: Map<string, RealTimeCalculationResult> = new Map();
  private subscribers: Map<string, (result: RealTimeCalculationResult) => void> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  calculateFees(
    productId: string,
    materials: EnhancedMaterial[],
    volume: number = 1,
    region: string = 'oregon'
  ): RealTimeCalculationResult {
    const cacheKey = this.generateCacheKey(productId, materials, volume, region);
    
    // Check cache first
    if (this.calculationCache.has(cacheKey)) {
      return this.calculationCache.get(cacheKey)!;
    }

    const calculation = calculateEnhancedEprFee(materials, region, volume);
    
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

    // Cache the result
    this.calculationCache.set(cacheKey, result);
    
    // Notify subscribers
    this.notifySubscribers(productId, result);
    
    return result;
  }

  calculateFeesWithDebounce(
    productId: string,
    materials: EnhancedMaterial[],
    volume: number = 1,
    region: string = 'oregon',
    debounceMs: number = 300
  ): Promise<RealTimeCalculationResult> {
    return new Promise((resolve) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(productId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        const result = this.calculateFees(productId, materials, volume, region);
        resolve(result);
        this.debounceTimers.delete(productId);
      }, debounceMs);

      this.debounceTimers.set(productId, timer);
    });
  }

  subscribe(productId: string, callback: (result: RealTimeCalculationResult) => void) {
    this.subscribers.set(productId, callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(productId);
    };
  }

  clearCache(productId?: string) {
    if (productId) {
      // Clear cache for specific product
      for (const key of this.calculationCache.keys()) {
        if (key.startsWith(productId)) {
          this.calculationCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.calculationCache.clear();
    }
  }

  private generateCacheKey(productId: string, materials: EnhancedMaterial[], volume: number, region: string): string {
    const materialHash = materials
      .map(m => `${m.type}-${m.weight}-${m.recyclable}-${m.postconsumerContent || 0}`)
      .join('|');
    return `${productId}-${volume}-${region}-${materialHash}`;
  }

  private notifySubscribers(productId: string, result: RealTimeCalculationResult) {
    const callback = this.subscribers.get(productId);
    if (callback) {
      callback(result);
    }
  }
}

// Global instance
export const realTimeFeeEngine = new RealTimeFeeCalculationEngine();
