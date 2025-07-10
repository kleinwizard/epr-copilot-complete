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
  designatedProducerId?: string;
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
    try {
      if (!companyData.legalName || !companyData.businessId) {
        throw new Error('Legal name and business ID are required');
      }
      const result = await apiService.saveCompanyInfo(companyData);
      localStorage.setItem('company_info', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Failed to save company info:', error);
      throw new Error(error.message || 'Failed to save company information');
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const products = await apiService.getProducts();
      return products || [];
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    try {
      if (!productData.name || !productData.sku) {
        throw new Error('Product name and SKU are required');
      }
      const result = await apiService.saveProduct(productData);
      return result;
    } catch (error) {
      console.error('Failed to save product:', error);
      throw new Error(error.message || 'Failed to save product');
    }
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
    try {
      if (!materialData.name || !materialData.category) {
        throw new Error('Material name and category are required');
      }
      const result = await apiService.saveMaterial(materialData);
      return result;
    } catch (error) {
      console.error('Failed to save material:', error);
      throw new Error(error.message || 'Failed to save material');
    }
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
