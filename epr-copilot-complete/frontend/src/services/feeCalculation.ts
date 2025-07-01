
// Oregon EPR fee rates (per kg) - based on 2024 regulations
export const oregonEprRates = {
  // Paper materials
  'Paper (Label)': 0.12,
  'Paper (Corrugated)': 0.08,
  'Cardboard': 0.10,
  
  // Plastic materials
  'Plastic (PET)': 0.45,
  'Plastic (HDPE)': 0.38,
  'Plastic (LDPE)': 0.62,
  'Plastic (PP)': 0.42,
  'Plastic (PS)': 0.78,
  'Plastic (Other)': 0.85,
  
  // Glass materials
  'Glass': 0.15,
  
  // Metal materials
  'Metal (Steel)': 0.22,
  'Metal (Aluminum)': 0.18,
} as const;

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

export async function calculateEprFee(materials: Array<{
  type: string;
  weight: number;
  recyclable: boolean;
}>): Promise<FeeCalculation> {
  const token = localStorage.getItem('access_token');
  const response = await fetch('https://app-gqghzcxc.fly.dev/api/fees/calculate', {
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

export async function calculateMonthlyFees(products: Array<{
  materials: Array<{ type: string; weight: number; recyclable: boolean; }>;
  monthlyVolume?: number;
}>): Promise<number> {
  let total = 0;
  
  for (const product of products) {
    const calculation = await calculateEprFee(product.materials);
    const volume = product.monthlyVolume || 1;
    total += calculation.totalFee * volume;
  }
  
  return total;
}
