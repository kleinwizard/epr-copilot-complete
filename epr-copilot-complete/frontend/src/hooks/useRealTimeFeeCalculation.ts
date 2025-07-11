
import { useState, useEffect, useCallback } from 'react';
import { CalculationEngine, RealTimeCalculationResult, EnhancedMaterial } from '@/services/calculationEngine';

interface UseRealTimeFeeCalculationProps {
  productId: string;
  materials: EnhancedMaterial[];
  volume?: number;
  region?: string;
  debounceMs?: number;
  autoUpdate?: boolean;
}

export function useRealTimeFeeCalculation({
  productId,
  materials,
  volume = 1,
  region = 'oregon',
  debounceMs = 300,
  autoUpdate = true
}: UseRealTimeFeeCalculationProps) {
  const [result, setResult] = useState<RealTimeCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFees = useCallback(async () => {
    if (!materials.length) {
      setResult(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const calculationResult = await CalculationEngine.calculateFeesWithDebounce(
        productId,
        materials,
        volume,
        region,
        debounceMs
      );
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  }, [productId, materials, volume, region, debounceMs]);

  // Auto-update when dependencies change
  useEffect(() => {
    if (autoUpdate) {
      calculateFees();
    }
  }, [calculateFees, autoUpdate]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = CalculationEngine.subscribe(productId, (newResult) => {
      setResult(newResult);
      setIsCalculating(false);
    });

    return unsubscribe;
  }, [productId]);

  const refresh = useCallback(() => {
    CalculationEngine.clearCache(productId);
    calculateFees();
  }, [productId, calculateFees]);

  return {
    result,
    isCalculating,
    error,
    calculateFees,
    refresh
  };
}
