
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

export interface SystemDataV1 {
  municipal_support_costs?: number;
  infrastructure_costs?: number;
  administrative_costs?: number;
  education_outreach_costs?: number;
  system_total_tonnage?: number;
}

export interface FeeCalculationRequestV1 {
  jurisdiction_code: string;
  producer_data: ProducerDataV1;
  packaging_data: PackagingComponentV1[];
  system_data?: SystemDataV1;
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

export interface CalculationStepResponse {
  step_number: number;
  step_name: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  rule_applied: string;
  legal_citation: string;
  calculation_method: string;
  timestamp: string;
  jurisdiction: string;
}

export interface AuditTraceResponse {
  calculation_id: string;
  jurisdiction: string;
  total_steps: number;
  audit_trail: CalculationStepResponse[];
  legal_citations: string[];
  calculation_timestamp: string;
}

export async function calculateEprFee(materials: Array<{
  type: string;
  weight: number;
  recyclable: boolean;
}>): Promise<FeeCalculation> {
  const token = localStorage.getItem('access_token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

export async function calculateEprFeeV1(request: FeeCalculationRequestV1): Promise<FeeCalculationResponseV1> {
  const token = localStorage.getItem('access_token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

export async function getCalculationTrace(calculationId: string): Promise<AuditTraceResponse> {
  const token = localStorage.getItem('access_token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  const response = await fetch(`${API_BASE_URL}/api/fees/v1/fees/${calculationId}/trace`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to retrieve calculation trace');
  }

  return response.json();
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

export async function calculateMonthlyFeesV1(
  jurisdictionCode: string,
  products: Array<{
    materials: Array<{ type: string; weight: number; recyclable: boolean; }>;
    monthlyVolume?: number;
  }>,
  producerData: ProducerDataV1
): Promise<number> {
  let total = 0;
  
  for (const product of products) {
    const packagingData = convertMaterialsToV1Format(product.materials, product.monthlyVolume || 1);
    
    const request: FeeCalculationRequestV1 = {
      jurisdiction_code: jurisdictionCode,
      producer_data: producerData,
      packaging_data: packagingData,
      data_source: 'frontend_monthly_calculation'
    };
    
    const result = await calculateEprFeeV1(request);
    total += result.total_fee;
  }
  
  return total;
}

export async function getSupportedJurisdictions(): Promise<Array<{code: string, name: string, model_type: string}>> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const response = await fetch(`${API_BASE_URL}/api/fees/jurisdictions`, {
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

export function convertMaterialsToV1Format(
  materials: Array<{ type: string; weight: number; recyclable: boolean; }>,
  unitsPerProduct: number = 1
): PackagingComponentV1[] {
  return materials.map((material, index) => ({
    material_type: material.type,
    component_name: `Component ${index + 1}`,
    weight_per_unit: material.weight / 1000, // Convert grams to kg
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
