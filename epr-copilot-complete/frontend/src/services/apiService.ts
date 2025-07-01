const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint);
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile(endpoint: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getCompanyInfo() {
    return this.get('/api/company');
  }

  async saveCompanyInfo(data: any) {
    return this.post('/api/company', data);
  }

  async getProducts() {
    return this.get('/api/products');
  }

  async saveProduct(data: any) {
    return this.post('/api/products', data);
  }

  async updateProduct(id: number, data: any) {
    return this.put(`/api/products/${id}`, data);
  }

  async getMaterials() {
    return this.get('/api/materials');
  }

  async saveMaterial(data: any) {
    return this.post('/api/materials', data);
  }

  async updateMaterial(id: number, data: any) {
    return this.put(`/api/materials/${id}`, data);
  }

  async getAnalytics() {
    return this.get('/api/analytics');
  }

  async getComplianceDueDates() {
    return this.get('/api/compliance/due-dates');
  }
}

export const apiService = new ApiService();
