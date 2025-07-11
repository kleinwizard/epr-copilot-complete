/**
 * Centralized Validation Service
 * 
 * This service consolidates all validation logic across the application
 * to ensure consistency and reduce code duplication.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'password' | 'sku' | 'weight' | 'url' | 'custom';
  message?: string;
  validator?: (value: any) => boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export class ValidationService {
  
  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors: errors.length > 0 ? { password: errors.join(', ') } : {}
    };
  }

  /**
   * Validate SKU format
   */
  static validateSKU(sku: string): boolean {
    return /^[A-Z0-9-]{3,20}$/.test(sku);
  }

  /**
   * Validate weight value
   */
  static validateWeight(weight: number): boolean {
    return weight > 0 && weight < 1000000; // Max 1M grams
  }

  /**
   * Validate URL format
   */
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate company profile data
   */
  static validateCompanyProfile(data: any): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!data.legalName?.trim()) {
      errors.push('Legal name is required');
      fieldErrors.legalName = 'Legal name is required';
    }

    if (!data.businessId?.trim()) {
      errors.push('Business ID is required');
      fieldErrors.businessId = 'Business ID is required';
    } else if (!/^\d{2}-\d{7}$/.test(data.businessId)) {
      errors.push('Business ID must be in format XX-XXXXXXX');
      fieldErrors.businessId = 'Business ID must be in format XX-XXXXXXX';
    }

    if (!data.address?.trim()) {
      errors.push('Address is required');
      fieldErrors.address = 'Address is required';
    }

    if (!data.city?.trim()) {
      errors.push('City is required');
      fieldErrors.city = 'City is required';
    }

    if (!data.zipCode?.trim()) {
      errors.push('ZIP code is required');
      fieldErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
      errors.push('ZIP code must be in format XXXXX or XXXXX-XXXX');
      fieldErrors.zipCode = 'ZIP code must be in format XXXXX or XXXXX-XXXX';
    }

    if (data.naicsCode && !/^\d{6}$/.test(data.naicsCode)) {
      errors.push('NAICS code must be 6 digits');
      fieldErrors.naicsCode = 'NAICS code must be 6 digits';
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Validate product data
   */
  static validateProduct(data: any): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.push('Product name is required');
      fieldErrors.name = 'Product name is required';
    }

    if (!data.sku?.trim()) {
      errors.push('SKU is required');
      fieldErrors.sku = 'SKU is required';
    } else if (!this.validateSKU(data.sku)) {
      errors.push('SKU must be 3-20 characters with letters, numbers, and hyphens only');
      fieldErrors.sku = 'SKU must be 3-20 characters with letters, numbers, and hyphens only';
    }

    if (data.weight !== undefined && !this.validateWeight(data.weight)) {
      errors.push('Weight must be between 0 and 1,000,000 grams');
      fieldErrors.weight = 'Weight must be between 0 and 1,000,000 grams';
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Validate material data
   */
  static validateMaterial(data: any): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.push('Material name is required');
      fieldErrors.name = 'Material name is required';
    }

    if (!data.category?.trim()) {
      errors.push('Category is required');
      fieldErrors.category = 'Category is required';
    }

    if (!data.materialType?.trim()) {
      errors.push('Material type is required');
      fieldErrors.materialType = 'Material type is required';
    }

    if (data.eprRate !== undefined && (data.eprRate < 0 || data.eprRate > 100)) {
      errors.push('EPR rate must be between 0 and 100');
      fieldErrors.eprRate = 'EPR rate must be between 0 and 100';
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Validate webhook configuration
   */
  static validateWebhook(data: any): ValidationResult {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      errors.push('Webhook name is required');
      fieldErrors.name = 'Webhook name is required';
    }

    if (!data.url?.trim()) {
      errors.push('Webhook URL is required');
      fieldErrors.url = 'Webhook URL is required';
    } else if (!this.validateURL(data.url)) {
      errors.push('Please enter a valid webhook URL');
      fieldErrors.url = 'Please enter a valid webhook URL';
    }

    if (!data.events?.trim()) {
      errors.push('At least one event type is required');
      fieldErrors.events = 'At least one event type is required';
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Generic field validation using rules
   */
  static validateField(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push(rule.message || 'This field is required');
          }
          break;
        
        case 'email':
          if (value && !this.validateEmail(value)) {
            errors.push(rule.message || 'Please enter a valid email address');
          }
          break;
        
        case 'sku':
          if (value && !this.validateSKU(value)) {
            errors.push(rule.message || 'SKU must be 3-20 characters with letters, numbers, and hyphens only');
          }
          break;
        
        case 'weight':
          if (value !== undefined && !this.validateWeight(value)) {
            errors.push(rule.message || 'Weight must be between 0 and 1,000,000 grams');
          }
          break;
        
        case 'url':
          if (value && !this.validateURL(value)) {
            errors.push(rule.message || 'Please enter a valid URL');
          }
          break;
        
        case 'custom':
          if (rule.validator && value && !rule.validator(value)) {
            errors.push(rule.message || 'Invalid value');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors: {}
    };
  }

  /**
   * Validate form data using a schema
   */
  static validateForm(data: Record<string, any>, schema: Record<string, ValidationRule[]>): ValidationResult {
    const allErrors: string[] = [];
    const fieldErrors: Record<string, string> = {};

    for (const [fieldName, rules] of Object.entries(schema)) {
      const fieldResult = this.validateField(data[fieldName], rules);
      if (!fieldResult.isValid) {
        allErrors.push(...fieldResult.errors);
        fieldErrors[fieldName] = fieldResult.errors[0]; // Take first error for field
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      fieldErrors
    };
  }
}

/**
 * Common validation schemas for reuse across components
 */
export const ValidationSchemas = {
  companyProfile: {
    legalName: [{ type: 'required' as const, message: 'Legal name is required' }],
    businessId: [
      { type: 'required' as const, message: 'Business ID is required' },
      { type: 'custom' as const, validator: (value: string) => /^\d{2}-\d{7}$/.test(value), message: 'Business ID must be in format XX-XXXXXXX' }
    ],
    address: [{ type: 'required' as const, message: 'Address is required' }],
    city: [{ type: 'required' as const, message: 'City is required' }],
    zipCode: [
      { type: 'required' as const, message: 'ZIP code is required' },
      { type: 'custom' as const, validator: (value: string) => /^\d{5}(-\d{4})?$/.test(value), message: 'ZIP code must be in format XXXXX or XXXXX-XXXX' }
    ],
    naicsCode: [
      { type: 'custom' as const, validator: (value: string) => !value || /^\d{6}$/.test(value), message: 'NAICS code must be 6 digits' }
    ]
  },

  product: {
    name: [{ type: 'required' as const, message: 'Product name is required' }],
    sku: [
      { type: 'required' as const, message: 'SKU is required' },
      { type: 'sku' as const }
    ],
    weight: [{ type: 'weight' as const }]
  },

  material: {
    name: [{ type: 'required' as const, message: 'Material name is required' }],
    category: [{ type: 'required' as const, message: 'Category is required' }],
    materialType: [{ type: 'required' as const, message: 'Material type is required' }]
  },

  webhook: {
    name: [{ type: 'required' as const, message: 'Webhook name is required' }],
    url: [
      { type: 'required' as const, message: 'Webhook URL is required' },
      { type: 'url' as const }
    ],
    events: [{ type: 'required' as const, message: 'At least one event type is required' }]
  }
};
