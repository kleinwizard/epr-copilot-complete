
/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item));
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    converted[snakeKey] = convertKeysToSnakeCase(value);
  }
  return converted;
}

/**
 * Convert object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item));
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    converted[camelKey] = convertKeysToCamelCase(value);
  }
  return converted;
}

/**
 * Product-specific field mappings
 */
const PRODUCT_FIELD_MAPPING = {
  eprFee: 'epr_fee',
  designatedProducerId: 'designated_producer_id',
  lastUpdated: 'last_updated',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  packagingComponents: 'packaging_components'
};

/**
 * Material-specific field mappings
 */
const MATERIAL_FIELD_MAPPING = {
  eprRate: 'epr_rate',
  materialType: 'material_type',
  packagingComponentType: 'packaging_component_type',
  pcrContent: 'pcr_content',
  carbonFootprint: 'carbon_footprint',
  sustainabilityScore: 'sustainability_score',
  recyclingProcess: 'recycling_process',
  sustainableAlternatives: 'sustainable_alternatives',
  lastUpdated: 'last_updated',
  createdAt: 'created_at'
};

/**
 * Convert product data from frontend format to backend format
 */
export function convertProductToBackendFields(productData: any): any {
  const converted: any = {};
  for (const [key, value] of Object.entries(productData)) {
    const backendKey = PRODUCT_FIELD_MAPPING[key as keyof typeof PRODUCT_FIELD_MAPPING] || camelToSnake(key);
    
    if (key === 'materials' && Array.isArray(value)) {
      converted[backendKey] = value.map(material => convertKeysToSnakeCase(material));
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      converted[backendKey] = convertKeysToSnakeCase(value);
    } else {
      converted[backendKey] = value;
    }
  }
  return converted;
}

/**
 * Convert material data from frontend format to backend format
 */
export function convertMaterialToBackendFields(materialData: any): any {
  const converted: any = {};
  for (const [key, value] of Object.entries(materialData)) {
    const backendKey = MATERIAL_FIELD_MAPPING[key as keyof typeof MATERIAL_FIELD_MAPPING] || camelToSnake(key);
    converted[backendKey] = value;
  }
  return converted;
}

/**
 * Convert product data from backend format to frontend format
 */
export function convertProductToFrontendFields(backendData: any): any {
  const reverseMapping = Object.fromEntries(
    Object.entries(PRODUCT_FIELD_MAPPING).map(([frontend, backend]) => [backend, frontend])
  );
  const converted: any = {};
  for (const [key, value] of Object.entries(backendData)) {
    const frontendKey = reverseMapping[key] || snakeToCamel(key);
    if (key === 'materials' && Array.isArray(value)) {
      converted[frontendKey] = value.map(material => convertKeysToCamelCase(material));
    } else if (key === 'packaging_components' && Array.isArray(value)) {
      converted['packagingComponents'] = value.map(component => convertKeysToCamelCase(component));
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      converted[frontendKey] = convertKeysToCamelCase(value);
    } else {
      converted[frontendKey] = value;
    }
  }
  return converted;
}

/**
 * Convert material data from backend format to frontend format
 */
export function convertMaterialToFrontendFields(backendData: any): any {
  const reverseMapping = Object.fromEntries(
    Object.entries(MATERIAL_FIELD_MAPPING).map(([frontend, backend]) => [backend, frontend])
  );
  const converted: any = {};
  for (const [key, value] of Object.entries(backendData)) {
    const frontendKey = reverseMapping[key] || snakeToCamel(key);
    converted[frontendKey] = value;
  }
  return converted;
}
