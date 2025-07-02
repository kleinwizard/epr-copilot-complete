/**
 * TypeScript interfaces for EPR v2.0 producer hierarchy and packaging models.
 * These interfaces match the backend SQLAlchemy models for v2.0 functionality.
 */

export interface EntityRole {
  id: string;
  organizationId: string;
  roleType: 'BRAND_OWNER' | 'IMPORTER' | 'ECOMMERCE_SHIPPER' | 'FRANCHISOR';
  jurisdictionId?: string;
  parentEntityId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductProducerDesignation {
  id: string;
  productId: string;
  designatedProducerId: string;
  jurisdictionId?: string;
  createdAt: string;
}

export interface ProducerProfile {
  id: string;
  organizationId: string;
  jurisdictionId: string;
  annualRevenue: number;
  annualRevenueScope: 'GLOBAL' | 'IN_STATE';
  annualTonnage: number;
  producesPerishableFood: boolean;
  isSmallProducer: boolean;
  qualifiesForLowVolumeFee: boolean;
  hasLcaDisclosure: boolean;
  hasEnvironmentalImpactReduction: boolean;
  usesReusablePackaging: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingComponent {
  id: string;
  productId: string;
  materialCategoryId: string;
  componentName: string;
  packagingLevel: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ECOM_SHIPPER' | 'SERVICE_WARE';
  weightPerUnit: number;
  weightUnit: string;
  recycledContentPercentage: number;
  
  isBeverageContainer: boolean;
  isMedicalExempt: boolean;
  isFifraExempt: boolean;
  
  caPlasticComponentFlag: boolean;
  meToxicityFlag: boolean;
  orLcaBonusTier?: 'A' | 'B' | 'C';
  
  containsPfas: boolean;
  containsPhthalates: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  sku: string;
  category: string;
  unitsSold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationRequest {
  producerData: {
    organizationId: string;
    annualRevenue: number;
    annualRevenueScope: 'GLOBAL' | 'IN_STATE';
    annualRevenueInState?: number;
    annualTonnage: number;
    producesPerishableFood: boolean;
    jurisdictionCode: string;
    entityRoles: string[];
    parentEntityId?: string;
    brandOwnerId?: string;
    ecommerceShipperId?: string;
    designatedProducerId?: string;
  };
  packagingData: Array<{
    materialType: string;
    componentName: string;
    packagingLevel: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ECOM_SHIPPER' | 'SERVICE_WARE';
    weightPerUnit: number;
    weightUnit: string;
    unitsSold: number;
    recycledContentPercentage: number;
    responsibleProducerId?: string;
    isBeverageContainer: boolean;
    isMedicalExempt: boolean;
    isFifraExempt: boolean;
    caPlasticComponentFlag: boolean;
    meToxicityFlag: boolean;
    orLcaBonusTier?: 'A' | 'B' | 'C';
  }>;
  productData?: {
    brandOwnerId?: string;
    ecommerceShipperId?: string;
    designatedProducerId?: string;
  };
  systemData?: {
    administrativeCosts?: number;
    infrastructureCosts?: number;
    systemTotalTonnage?: number;
  };
}

export interface CalculationResult {
  calculationId: string;
  jurisdiction: string;
  totalFee: number;
  currency: string;
  calculationTimestamp: string;
  auditTrail: CalculationStep[];
  calculationBreakdown: Record<string, any>;
  legalCitations: string[];
  complianceStatus: string;
}

export interface CalculationStep {
  stepNumber: number;
  stepName: string;
  inputData: any;
  outputData: any;
  ruleApplied: string;
  legalCitation: string;
  calculationMethod: string;
  timestamp: string;
  jurisdiction: string;
}

export interface ProducerHierarchy {
  organization: Organization;
  entityRoles: EntityRole[];
  parentEntity?: Organization;
  childEntities: Organization[];
  producerProfiles: ProducerProfile[];
  products: Product[];
  productDesignations: ProductProducerDesignation[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  message?: string;
}

export interface ProducerProfileForm {
  organizationId: string;
  jurisdictionId: string;
  annualRevenue: string;
  annualRevenueScope: 'GLOBAL' | 'IN_STATE';
  annualRevenueInState?: string;
  annualTonnage: string;
  producesPerishableFood: boolean;
  hasLcaDisclosure: boolean;
  hasEnvironmentalImpactReduction: boolean;
  usesReusablePackaging: boolean;
}

export interface PackagingComponentForm {
  productId: string;
  materialCategoryId: string;
  componentName: string;
  packagingLevel: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ECOM_SHIPPER' | 'SERVICE_WARE';
  weightPerUnit: string;
  weightUnit: string;
  recycledContentPercentage: string;
  isBeverageContainer: boolean;
  isMedicalExempt: boolean;
  isFifraExempt: boolean;
  caPlasticComponentFlag: boolean;
  meToxicityFlag: boolean;
  orLcaBonusTier?: 'A' | 'B' | 'C';
}

export interface EntityRoleForm {
  organizationId: string;
  roleType: 'BRAND_OWNER' | 'IMPORTER' | 'ECOMMERCE_SHIPPER' | 'FRANCHISOR';
  jurisdictionId?: string;
  parentEntityId?: string;
  isActive: boolean;
}
