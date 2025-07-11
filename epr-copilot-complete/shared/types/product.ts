export interface Product {
  id: string;
  organization_id: string;
  name: string;
  sku: string;
  category?: string;
  weight?: number;
  status?: string;
  description?: string;
  upc?: string;
  manufacturer?: string;
  epr_fee?: number;
  designated_producer_id?: string;
  materials?: ProductMaterial[];
  packaging_components?: PackagingComponent[];
  last_updated?: string;
  created_at?: string;
}

export interface ProductForm {
  name: string;
  sku: string;
  category?: string;
  weight?: number;
  status?: string;
  description?: string;
  upc?: string;
  manufacturer?: string;
  eprFee?: number;
  designatedProducerId?: string;
  materials?: ProductMaterialForm[];
  lastUpdated?: string;
}

export interface ProductMaterial {
  type: string;
  weight: number;
  recyclable: boolean;
}

export interface ProductMaterialForm {
  type: string;
  weight: number;
  recyclable: boolean;
}

export interface PackagingComponent {
  id: string;
  product_id: string;
  material_category_id: string;
  component_name: string;
  packaging_level: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ECOM_SHIPPER' | 'SERVICE_WARE';
  weight_per_unit: number;
  weight_unit: string;
  recycled_content_percentage: number;
  is_beverage_container: boolean;
  is_medical_exempt: boolean;
  is_fifra_exempt: boolean;
  ca_plastic_component_flag: boolean;
  me_toxicity_flag: boolean;
  or_lca_bonus_tier?: 'A' | 'B' | 'C';
  contains_pfas: boolean;
  contains_phthalates: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  organization_id: string;
  name: string;
  epr_rate?: number;
  recyclable: boolean;
  created_at?: string;
}

export interface MaterialForm {
  name: string;
  eprRate?: number;
  recyclable: boolean;
}

export const PRODUCT_FIELD_MAPPING = {
  eprFee: 'epr_fee',
  designatedProducerId: 'designated_producer_id',
  lastUpdated: 'last_updated'
} as const;

export function convertProductToBackendFields(frontendData: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(frontendData)) {
    const backendKey = PRODUCT_FIELD_MAPPING[key as keyof typeof PRODUCT_FIELD_MAPPING] || key;
    converted[backendKey] = value;
  }
  
  return converted;
}

export function convertProductToFrontendFields(backendData: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  const reverseMapping = Object.fromEntries(
    Object.entries(PRODUCT_FIELD_MAPPING).map(([frontend, backend]) => [backend, frontend])
  );
  
  for (const [key, value] of Object.entries(backendData)) {
    const frontendKey = reverseMapping[key] || key;
    converted[frontendKey] = value;
  }
  
  return converted;
}
