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
      const products = await apiService.getProducts();
      return (products || []).map(product => {
        if (product.designated_producer_id !== undefined) {
          product.designatedProducerId = product.designated_producer_id;
          delete product.designated_producer_id;
        }
        return product;
      });
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const response = await apiService.saveProduct(productData);
    if (response.designated_producer_id !== undefined) {
      response.designatedProducerId = response.designated_producer_id;
      delete response.designated_producer_id;
    }
    return response;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const response = await apiService.updateProduct(id, productData);
    if (response.designated_producer_id !== undefined) {
      response.designatedProducerId = response.designated_producer_id;
      delete response.designated_producer_id;
    }
    return response;
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

  async getSavedSearches(): Promise<any[]> {
    try {
      const searches = await apiService.get('/api/saved-searches');
      return searches || [];
    } catch (error) {
      console.error('Failed to get saved searches:', error);
      return [];
    }
  }

  async saveSearch(searchData: { name: string; criteria: any }): Promise<any> {
    try {
      const savedSearch = await apiService.post('/api/saved-searches', searchData);
      return savedSearch;
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  }

  async deleteSavedSearch(searchId: string): Promise<void> {
    try {
      await apiService.delete(`/api/saved-searches/${searchId}`);
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      throw error;
    }
  }
}

export const dataService = new DataService();
