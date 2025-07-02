
import { oregonEprRates, calculateEprFeeV1, FeeCalculationRequestV1, PackagingComponentV1, ProducerDataV1, convertMaterialsToV1Format } from './feeCalculation';

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


export interface EnhancedFeeCalculationV1 {
  calculation_id: string;
  jurisdiction: string;
  total_fee: number;
  currency: string;
  materials: Array<{
    material_type: string;
    component_name: string;
    weight_per_unit: number;
    units_sold: number;
    base_fee: number;
    adjusted_fee: number;
    eco_modulation_applied: boolean;
  }>;
  breakdown: {
    base_fee: number;
    eco_modulation_adjustment: number;
    exemptions_applied: number;
    final_fee: number;
  };
  compliance_status: string;
  legal_citations: string[];
  calculation_timestamp: string;
}

export async function calculateEnhancedEprFeeV1(
  jurisdictionCode: string,
  materials: EnhancedMaterial[],
  producerData: {
    organization_id: string;
    annual_revenue: number;
    annual_tonnage: number;
    produces_perishable_food?: boolean;
  },
  volume: number = 1
): Promise<EnhancedFeeCalculationV1> {
  
  const packagingData: PackagingComponentV1[] = materials.map((material, index) => ({
    material_type: material.type,
    component_name: `Component ${index + 1}`,
    weight_per_unit: material.weight / 1000, // Convert grams to kg
    weight_unit: 'kg',
    units_sold: volume,
    recycled_content_percentage: (material.postconsumerContent || 0) * 100,
    recyclable: material.recyclable,
    reusable: material.isReusable || false,
    disrupts_recycling: false,
    recyclability_score: material.recyclable ? 75 : 25,
    contains_pfas: false,
    contains_phthalates: false,
    marine_degradable: material.biodegradable || false,
    harmful_to_marine_life: false,
    bay_friendly: false,
    cold_weather_stable: true
  }));

  const producerDataV1: ProducerDataV1 = {
    organization_id: producerData.organization_id,
    annual_revenue: producerData.annual_revenue,
    annual_tonnage: producerData.annual_tonnage,
    produces_perishable_food: producerData.produces_perishable_food || false,
    has_lca_disclosure: false,
    has_environmental_impact_reduction: false,
    uses_reusable_packaging: materials.some(m => m.isReusable),
    annual_recycling_rates: []
  };

  const request: FeeCalculationRequestV1 = {
    jurisdiction_code: jurisdictionCode,
    producer_data: producerDataV1,
    packaging_data: packagingData,
    data_source: 'frontend_enhanced_calculation'
  };

  const result = await calculateEprFeeV1(request);

  return {
    calculation_id: result.calculation_id,
    jurisdiction: result.jurisdiction,
    total_fee: result.total_fee,
    currency: result.currency,
    materials: packagingData.map((component, index) => ({
      material_type: component.material_type,
      component_name: component.component_name,
      weight_per_unit: component.weight_per_unit,
      units_sold: component.units_sold,
      base_fee: result.total_fee / packagingData.length, // Simplified allocation
      adjusted_fee: result.total_fee / packagingData.length,
      eco_modulation_applied: true
    })),
    breakdown: {
      base_fee: result.calculation_breakdown?.base_fee || result.total_fee,
      eco_modulation_adjustment: result.calculation_breakdown?.eco_modulation_adjustment || 0,
      exemptions_applied: result.calculation_breakdown?.exemptions_applied || 0,
      final_fee: result.total_fee
    },
    compliance_status: result.compliance_status,
    legal_citations: result.legal_citations,
    calculation_timestamp: result.calculation_timestamp
  };
}

export async function validateProductComplianceV1(
  jurisdictionCode: string,
  materials: EnhancedMaterial[],
  producerData: {
    organization_id: string;
    annual_revenue: number;
    annual_tonnage: number;
  }
): Promise<ComplianceResult> {
  try {
    const calculation = await calculateEnhancedEprFeeV1(
      jurisdictionCode,
      materials,
      producerData
    );

    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredActions: string[] = [];

    if (calculation.compliance_status === 'non_compliant') {
      requiredActions.push('Product does not meet EPR compliance requirements');
    } else if (calculation.compliance_status === 'warning') {
      warnings.push('Product has compliance concerns that should be addressed');
    }

    if (calculation.legal_citations.some(citation => citation.includes('recyclability'))) {
      recommendations.push('Consider improving material recyclability to reduce fees');
    }

    if (calculation.legal_citations.some(citation => citation.includes('post-consumer'))) {
      recommendations.push('Increase post-consumer recycled content for fee reductions');
    }

    if (warnings.length === 0 && recommendations.length === 0 && requiredActions.length === 0) {
      return validateProductCompliance(materials, jurisdictionCode);
    }

    return {
      isCompliant: requiredActions.length === 0,
      warnings,
      recommendations,
      requiredActions
    };

  } catch (error) {
    console.error('Failed to validate compliance using backend:', error);
    return validateProductCompliance(materials, jurisdictionCode);
  }
}
