import { API_CONFIG } from '@/config/api.config';
import { authService } from './authService';
import { convertProductToBackendFields, convertMaterialToBackendFields } from '@/utils/fieldConverter';

class ApiService {
  private getAuthHeaders() {
    const token = authService.getAccessToken();
    if (!token && import.meta.env.MODE !== 'development') {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || 'dev-token-development'}`,
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = API_CONFIG.getApiUrl(endpoint);
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `API request failed: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
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

    const token = authService.getAccessToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_CONFIG.getApiUrl(endpoint), {
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
    return this.put('/api/company/profile', data);
  }

  async getProducts() {
    return this.get('/api/products');
  }

  async saveProduct(data: any) {
    const backendData = convertProductToBackendFields(data);
    return this.post('/api/products', backendData);
  }

  async updateProduct(id: number, data: any) {
    const backendData = convertProductToBackendFields(data);
    return this.put(`/api/products/${id}`, backendData);
  }

  async getMaterials() {
    return this.get('/api/materials');
  }

  async saveMaterial(data: any) {
    const backendData = convertMaterialToBackendFields(data);
    return this.post('/api/materials', backendData);
  }

  async updateMaterial(id: number, data: any) {
    const backendData = convertMaterialToBackendFields(data);
    return this.put(`/api/materials/${id}`, backendData);
  }

  async getAnalytics() {
    return this.get('/api/analytics');
  }

  async getComplianceDueDates() {
    return this.get('/api/compliance/due-dates');
  }

  async getComplianceScore() {
    return this.get('/api/compliance/score');
  }

  async getComplianceIssues() {
    return this.get('/api/compliance/issues');
  }

  async updateComplianceIssueStatus(id: string, status: string) {
    return this.put(`/api/compliance/issues/${id}/status`, { status });
  }

  async getFeeDeadlines() {
    return this.get('/api/fees/deadlines');
  }

  async getFeeHistory() {
    return this.get('/api/fees/history');
  }

  async getActiveVendorsCount() {
    return this.get('/api/vendors/count?status=active');
  }

  async getConnectedVendorsCount() {
    return this.get('/api/vendors/count?status=connected');
  }

  async getWorkspacesCount() {
    return this.get('/api/workspaces/count');
  }

  async getUnreadMessagesCount() {
    return this.get('/api/messages/count?unread=true');
  }

  async getEcommerceIntegrationsCount() {
    return this.get('/api/integrations/count?type=ecommerce');
  }

  async getSupplyChainIntegrationsCount() {
    return this.get('/api/integrations/count?type=supply-chain');
  }

  async getCustomApiIntegrationsCount() {
    return this.get('/api/integrations/count?type=custom-api');
  }

  async getWebhookIntegrationsCount() {
    return this.get('/api/integrations/count?type=webhook');
  }

  async getNotifications() {
    return this.get('/api/notifications/');
  }

  async markNotificationAsRead(id: string) {
    return this.put(`/api/notifications/${id}/read`, {});
  }

  async getDataUsage() {
    return this.get('/api/data/usage');
  }

  async exportData(type: string, format: string) {
    return this.get(`/api/export/${type}?format=${format}`);
  }

  async exportProducts(format: string = 'csv') {
    return this.get(`/api/export/products?format=${format}`);
  }

  async exportMaterials(format: string = 'json') {
    return this.get(`/api/export/materials?format=${format}`);
  }

  async exportReports(format: string = 'pdf') {
    return this.get(`/api/export/reports?format=${format}`);
  }

  async exportFullData() {
    return this.get('/api/export/full-data');
  }

  async getAnalyticsOverview() {
    return this.get('/api/analytics/overview');
  }

  async getComplianceMetrics() {
    return this.get('/api/analytics/compliance-metrics');
  }

  async getCostAnalysis() {
    return this.get('/api/analytics/cost-analysis');
  }

  async getProjections() {
    return this.get('/api/analytics/projections');
  }

  async getImportHistory() {
    return this.get('/api/imports/history');
  }

  async downloadErrorReport(importId: number) {
    return this.get(`/api/imports/${importId}/error-report`);
  }

  async calculateMaterialProperties(materialData: {
    materialType: string;
    category: string;
    pcrContent: number;
  }) {
    return this.post('/api/materials/calculate-properties', materialData);
  }

  async getUserProfile() {
    return this.get('/api/user/profile');
  }

  async updateUserProfile(profileData: any) {
    return this.put('/api/user/profile', profileData);
  }
}

export const apiService = new ApiService();
