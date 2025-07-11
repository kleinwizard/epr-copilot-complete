export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  
  getApiUrl: (endpoint: string) => {
    const baseUrl = API_CONFIG.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseUrl}${cleanEndpoint}`;
  },
  
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
