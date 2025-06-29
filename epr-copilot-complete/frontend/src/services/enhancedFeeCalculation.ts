
import { oregonEprRates } from './feeCalculation';

export interface EnhancedMaterial {
  type: string;
  weight: number;
  recyclable: boolean;
  postconsumerContent?: number;
  isReusable?: boolean;
  biodegradable?: boolean;
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

export function calculateEnhancedEprFee(
  materials: EnhancedMaterial[],
  region: string = 'oregon',
  volume: number = 1
) {
  const rates = regionalRates[region] || regionalRates.oregon;
  
  const materialFees = materials.map(material => {
    const baseRate = rates.baseRates[material.type] || 0.50;
    let adjustedRate = baseRate;
    
    // Apply recyclability discount
    if (material.recyclable) {
      adjustedRate *= (1 - rates.recyclabilityDiscount);
    }
    
    // Apply post-consumer content bonus
    if (material.postconsumerContent && material.postconsumerContent > 0.30) {
      adjustedRate *= (1 - rates.postconsumerBonus);
    }
    
    // Apply reusability discount
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

export function validateProductCompliance(
  materials: EnhancedMaterial[],
  region: string = 'oregon'
): ComplianceResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const requiredActions: string[] = [];
  
  const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0);
  const recyclableWeight = materials.filter(m => m.recyclable).reduce((sum, m) => sum + m.weight, 0);
  const recyclabilityRate = recyclableWeight / totalWeight;
  
  // Check recyclability thresholds
  if (recyclabilityRate < 0.50) {
    warnings.push('Product recyclability is below 50% - consider material alternatives');
    recommendations.push('Explore more recyclable material options');
  }
  
  if (recyclabilityRate < 0.30) {
    requiredActions.push('Product does not meet minimum recyclability requirements');
  }
  
  // Check for problematic materials
  const problematicMaterials = materials.filter(m => 
    m.type.includes('PS') || m.type.includes('Other')
  );
  
  if (problematicMaterials.length > 0) {
    warnings.push('Contains materials with limited recycling infrastructure');
    recommendations.push('Consider alternatives to polystyrene and mixed plastics');
  }
  
  // Check material diversity
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

export function generateComplianceSuggestions(materials: EnhancedMaterial[]): string[] {
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
