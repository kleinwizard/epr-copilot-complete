
export interface RegulatoryAPI {
  id: string;
  name: string;
  provider: string;
  region: string;
  type: 'fee_rates' | 'material_database' | 'compliance_rules' | 'reporting_formats';
  status: 'active' | 'inactive' | 'error';
  lastUpdate: string;
  updateFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly';
  apiEndpoint: string;
  apiKey?: string;
  dataVersion: string;
}

export interface RegulatoryData {
  id: string;
  apiId: string;
  category: string;
  data: any;
  lastUpdated: string;
  version: string;
  jurisdiction: string;
}

export interface ApiUsageStats {
  apiId: string;
  requestsToday: number;
  requestsThisMonth: number;
  errorRate: number;
  averageResponseTime: number;
  dataFreshness: number; // hours since last update
}

// Mock regulatory APIs
const mockRegulatoryAPIs: RegulatoryAPI[] = [
  {
    id: 'ca-epr-001',
    name: 'California EPR Fee Rates API',
    provider: 'CalRecycle',
    region: 'California',
    type: 'fee_rates',
    status: 'active',
    lastUpdate: '2024-06-24T06:00:00Z',
    updateFrequency: 'daily',
    apiEndpoint: 'https://api.calrecycle.ca.gov/epr/fees',
    dataVersion: '2024.6.1'
  },
  {
    id: 'eu-reach-001',
    name: 'EU REACH Substance Database',
    provider: 'ECHA',
    region: 'European Union',
    type: 'material_database',
    status: 'active',
    lastUpdate: '2024-06-23T12:00:00Z',
    updateFrequency: 'weekly',
    apiEndpoint: 'https://api.echa.europa.eu/reach',
    dataVersion: '2024.25'
  },
  {
    id: 'or-epr-001',
    name: 'Oregon EPR Compliance Rules',
    provider: 'Oregon DEQ',
    region: 'Oregon',
    type: 'compliance_rules',
    status: 'active',
    lastUpdate: '2024-06-24T08:00:00Z',
    updateFrequency: 'monthly',
    apiEndpoint: 'https://api.oregon.gov/deq/epr',
    dataVersion: '2024.6'
  },
  {
    id: 'can-epr-001',
    name: 'Canada EPR Reporting Formats',
    provider: 'Environment Canada',
    region: 'Canada',
    type: 'reporting_formats',
    status: 'inactive',
    lastUpdate: '2024-06-20T00:00:00Z',
    updateFrequency: 'monthly',
    apiEndpoint: 'https://api.ec.gc.ca/epr/formats',
    dataVersion: '2024.5'
  }
];

const mockUsageStats: ApiUsageStats[] = [
  {
    apiId: 'ca-epr-001',
    requestsToday: 45,
    requestsThisMonth: 1247,
    errorRate: 2.1,
    averageResponseTime: 450,
    dataFreshness: 6
  },
  {
    apiId: 'eu-reach-001',
    requestsToday: 12,
    requestsThisMonth: 342,
    errorRate: 0.5,
    averageResponseTime: 890,
    dataFreshness: 18
  },
  {
    apiId: 'or-epr-001',
    requestsToday: 8,
    requestsThisMonth: 156,
    errorRate: 1.8,
    averageResponseTime: 320,
    dataFreshness: 4
  }
];

export const getRegulatoryAPIs = (): RegulatoryAPI[] => {
  return mockRegulatoryAPIs;
};

export const getActiveRegulatoryAPIs = (): RegulatoryAPI[] => {
  return mockRegulatoryAPIs.filter(api => api.status === 'active');
};

export const getRegulatoryAPIById = (id: string): RegulatoryAPI | undefined => {
  return mockRegulatoryAPIs.find(api => api.id === id);
};

export const getApiUsageStats = (apiId?: string): ApiUsageStats[] => {
  if (apiId) {
    return mockUsageStats.filter(stats => stats.apiId === apiId);
  }
  return mockUsageStats;
};

export const fetchLatestFeeRates = async (jurisdiction: string): Promise<any> => {
  console.log(`Fetching latest fee rates for ${jurisdiction}...`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockFeeRates = {
    jurisdiction,
    effective_date: '2024-01-01',
    rates: {
      plastic: {
        pet: 0.15,
        hdpe: 0.12,
        other: 0.18
      },
      paper: {
        cardboard: 0.08,
        mixed_paper: 0.10
      },
      glass: 0.05,
      metal: {
        aluminum: 0.20,
        steel: 0.15
      }
    },
    currency: 'USD',
    unit: 'per_pound'
  };

  return mockFeeRates;
};

export const fetchMaterialDatabase = async (region: string): Promise<any> => {
  console.log(`Fetching material database for ${region}...`);
  
  await new Promise(resolve => setTimeout(resolve, 1500));

  const mockMaterials = {
    region,
    version: '2024.6.1',
    materials: [
      {
        id: 'PET-001',
        name: 'Polyethylene Terephthalate',
        category: 'plastic',
        recyclability: 'high',
        epr_applicable: true,
        regulatory_notes: 'Subject to extended producer responsibility'
      },
      {
        id: 'HDPE-001',
        name: 'High-Density Polyethylene',
        category: 'plastic',
        recyclability: 'high',
        epr_applicable: true,
        regulatory_notes: 'Widely recyclable, preferred material'
      }
    ]
  };

  return mockMaterials;
};

export const fetchComplianceRules = async (jurisdiction: string): Promise<any> => {
  console.log(`Fetching compliance rules for ${jurisdiction}...`);
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockRules = {
    jurisdiction,
    version: '2024.6',
    rules: [
      {
        id: 'EPR-001',
        title: 'Quarterly Reporting Requirement',
        description: 'All producers must submit quarterly packaging data',
        deadline: 'Last day of month following quarter end',
        penalty: 'Up to $10,000 per day'
      },
      {
        id: 'EPR-002',
        title: 'Material Content Disclosure',
        description: 'Products must disclose recycled content percentage',
        requirement: 'Minimum 30% recycled content by 2025',
        verification: 'Third-party certification required'
      }
    ]
  };

  return mockRules;
};

export const updateApiData = async (apiId: string): Promise<boolean> => {
  const api = getRegulatoryAPIById(apiId);
  if (!api) {
    throw new Error('API not found');
  }

  console.log(`Updating data from ${api.name}...`);
  
  // Simulate API update
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update last update time
  api.lastUpdate = new Date().toISOString();

  // Random success for demo
  const success = Math.random() > 0.1;
  
  if (!success) {
    api.status = 'error';
    throw new Error('Failed to update API data');
  }

  return success;
};

export const getRegulatoryApiStats = () => {
  const apis = getRegulatoryAPIs();
  const activeApis = getActiveRegulatoryAPIs();
  const totalUsage = mockUsageStats.reduce((sum, stats) => sum + stats.requestsToday, 0);
  const avgErrorRate = mockUsageStats.reduce((sum, stats) => sum + stats.errorRate, 0) / mockUsageStats.length;

  return {
    totalApis: apis.length,
    activeApis: activeApis.length,
    totalRequestsToday: totalUsage,
    averageErrorRate: avgErrorRate,
    lastUpdate: Math.max(...apis.map(api => new Date(api.lastUpdate).getTime())),
    dataFreshness: Math.min(...mockUsageStats.map(stats => stats.dataFreshness))
  };
};
