
export const APP_CONFIG = {
  name: 'Oregon EPR Platform',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 30000,
    retryAttempts: 3,
  },
  
  // Feature Flags
  features: {
    ai: true,
    mobileApp: true,
    analytics: true,
    integrations: true,
    realTimeSync: false, // Requires backend
  },
  
  // Limits
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxProducts: 10000,
    maxMaterials: 1000,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Oregon EPR Specific
  oregon: {
    deadlineDate: '2025-03-31',
    currentYear: new Date().getFullYear(),
    quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
    supportedFileTypes: ['.csv', '.xlsx', '.pdf'],
  }
};

export const ROUTES = {
  dashboard: '/',
  products: '/products',
  materials: '/materials',
  reports: '/reports',
  analytics: '/analytics',
  settings: '/settings',
  help: '/help',
} as const;

export const LOCAL_STORAGE_KEYS = {
  user: 'oregon_epr_user',
  settings: 'oregon_epr_settings',
  draftReports: 'oregon_epr_draft_reports',
  products: 'oregon_epr_products',
  materials: 'oregon_epr_materials',
} as const;
