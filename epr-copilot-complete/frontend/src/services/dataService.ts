import { CalculationUtils } from './calculationEngine';
import { apiService } from './apiService';

export interface CompanyData {
  legalName: string;
  dbaName: string;
  businessId: string;
  deqNumber: string;
  address: string;
  city: string;
  zipCode: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  weight: number;
  materials: Array<{
    type: string;
    weight: number;
    recyclable: boolean;
  }>;
  status: string;
  lastUpdated: string;
  eprFee: number;
}

export interface Material {
  id: number;
  name: string;
  category: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  densityRange: { min: number; max: number };
  sustainabilityScore: number;
  alternatives: string[];
  complianceStatus: 'Compliant' | 'Restricted' | 'Banned';
  lastUpdated: string;
  description: string;
  carbonFootprint: number;
  recyclingProcess: string;
  endOfLife: string[];
}

class DataService {
  async getCompanyInfo(): Promise<CompanyData | null> {
    try {
      return await apiService.getCompanyInfo();
    } catch (error) {
      console.error('Failed to get company info:', error);
      return null;
    }
  }

  async saveCompanyInfo(companyData: CompanyData): Promise<CompanyData> {
    return await apiService.saveCompanyInfo(companyData);
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await apiService.getProducts();
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    return await apiService.saveProduct(productData);
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    return await apiService.updateProduct(id, productData);
  }

  async getMaterials(): Promise<Material[]> {
    try {
      return await apiService.getMaterials();
    } catch (error) {
      console.error('Failed to get materials:', error);
      return [];
    }
  }

  async saveMaterial(materialData: Partial<Material>): Promise<Material> {
    return await apiService.saveMaterial(materialData);
  }

  async updateMaterial(id: number, materialData: Partial<Material>): Promise<Material> {
    return await apiService.updateMaterial(id, materialData);
  }

  async getAnalytics() {
    try {
      return await apiService.getAnalytics();
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return {
        complianceScore: 0,
        daysToDeadline: 0,
        totalProducts: 0,
        totalFees: 0
      };
    }
  }

  async getComplianceDueDates() {
    try {
      return await apiService.getComplianceDueDates();
    } catch (error) {
      console.error('Failed to get compliance due dates:', error);
      return [];
    }
  }

  async uploadDocument(file: File): Promise<{ success: boolean; filename: string }> {
    try {
      const result = await apiService.uploadFile('/api/documents/upload', file);
      return {
        success: true,
        filename: result.filename || file.name
      };
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }
}

export const dataService = new DataService();
