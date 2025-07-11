export interface CompanyProfile {
  id?: string;
  name: string;
  legal_name?: string;
  business_id?: string;
  deq_number?: string;
  naics_code?: string;
  entity_type?: string;
  description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyProfileForm {
  legalName: string;
  dbaName?: string;
  businessId: string;
  deqNumber?: string;
  naicsCode?: string;
  entityType?: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
}

export interface ComplianceProfile {
  id?: string;
  jurisdiction: string;
  annualRevenue: number;
  annualTonnage: number;
  created_at?: string;
}

export interface BusinessEntity {
  id?: string;
  name: string;
  roles: string[];
  type: 'primary' | 'subsidiary';
  created_at?: string;
}

export interface CompanyDocument {
  id?: string;
  name?: string;
  filename?: string;
  type?: string;
  url?: string;
  size?: number;
  uploadedAt?: string;
  upload_date?: string;
}

export interface CompanySetupData {
  companyData: CompanyProfile;
  profiles: ComplianceProfile[];
  entities: BusinessEntity[];
  documents: CompanyDocument[];
}

export const FIELD_MAPPING = {
  legalName: 'legal_name',
  businessId: 'business_id',
  deqNumber: 'deq_number',
  naicsCode: 'naics_code',
  entityType: 'entity_type',
  streetAddress: 'street_address',
  zipCode: 'zip_code',
  dbaName: 'dba_name'
} as const;

export function convertToBackendFields(frontendData: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(frontendData)) {
    const backendKey = FIELD_MAPPING[key as keyof typeof FIELD_MAPPING] || key;
    converted[backendKey] = value;
  }
  
  return converted;
}

export function convertToFrontendFields(backendData: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  const reverseMapping = Object.fromEntries(
    Object.entries(FIELD_MAPPING).map(([frontend, backend]) => [backend, frontend])
  );
  
  for (const [key, value] of Object.entries(backendData)) {
    const frontendKey = reverseMapping[key] || key;
    converted[frontendKey] = value;
  }
  
  return converted;
}
