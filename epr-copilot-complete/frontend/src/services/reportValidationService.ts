
import { ReportProduct } from './reportService';

export interface ReportValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
}

export function validateReport(products: ReportProduct[]): ReportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (products.length === 0) {
    errors.push('Report must contain at least one product');
  }
  
  products.forEach((product, index) => {
    if (!product.name || product.name.trim().length === 0) {
      errors.push(`Product ${index + 1}: Name is required`);
    }
    
    if (!product.sku || product.sku.trim().length === 0) {
      errors.push(`Product ${index + 1}: SKU is required`);
    }
    
    if (product.unitsSold <= 0) {
      errors.push(`Product ${index + 1}: Units sold must be greater than 0`);
    }
    
    if (product.materials.length === 0) {
      errors.push(`Product ${index + 1}: Must have at least one material`);
    }
    
    product.materials.forEach((material, matIndex) => {
      if (material.weight <= 0) {
        errors.push(`Product ${index + 1}, Material ${matIndex + 1}: Weight must be greater than 0`);
      }
    });
  });
  
  const completeness = Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2));
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness
  };
}
