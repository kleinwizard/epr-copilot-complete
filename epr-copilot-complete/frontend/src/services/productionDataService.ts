
import { API_CONFIG } from '../config/api.config';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import { SecureStorage } from '../utils/storage';
import { withRetry } from '../utils/errorHandling';

export class ProductionDataService {
  static async fetchProducts(filters?: any) {
    return withRetry(async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_CONFIG.getApiUrl('/products'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return await response.json();
    });
  }
  
  static async saveProduct(product: any) {
    return withRetry(async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_CONFIG.getApiUrl('/products'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      return await response.json();
    });
  }
  
  static async fetchMaterials() {
    return withRetry(async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_CONFIG.getApiUrl('/materials'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      
      return await response.json();
    });
  }
  
  static async generateReport(params: any) {
    return withRetry(async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_CONFIG.getApiUrl('/reports/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      return await response.json();
    });
  }
  
  static async uploadFile(file: File) {
    return withRetry(async () => {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(API_CONFIG.getApiUrl('/files/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return await response.json();
    });
  }
}
