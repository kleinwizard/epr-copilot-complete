export const API_CONFIG = {
  getBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    return baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  },
  
  getApiUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}/api${cleanEndpoint}`;
  }
};
