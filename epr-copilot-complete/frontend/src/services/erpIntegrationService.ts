
export interface ERPSystem {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'microsoft' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataTypes: string[];
  apiEndpoint?: string;
  credentials?: {
    encrypted: boolean;
    lastUpdated: string;
  };
}

export interface ERPDataMapping {
  id: string;
  erpSystemId: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  validation?: string;
  required: boolean;
}

export interface SyncResult {
  id: string;
  erpSystemId: string;
  timestamp: string;
  status: 'success' | 'partial' | 'failed';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors?: string[];
  duration: number;
}

const mockERPSystems: ERPSystem[] = [];

const mockSyncHistory: SyncResult[] = [];

export const getERPSystems = (): ERPSystem[] => {
  return mockERPSystems;
};

export const getConnectedERPSystems = (): ERPSystem[] => {
  return mockERPSystems.filter(system => system.status === 'connected');
};

export const getERPSystemById = (id: string): ERPSystem | undefined => {
  return mockERPSystems.find(system => system.id === id);
};

export const getSyncHistory = (erpSystemId?: string): SyncResult[] => {
  if (erpSystemId) {
    return mockSyncHistory.filter(sync => sync.erpSystemId === erpSystemId);
  }
  return mockSyncHistory.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const triggerSync = async (erpSystemId: string): Promise<SyncResult> => {
  const system = getERPSystemById(erpSystemId);
  if (!system) {
    throw new Error('ERP system not found');
  }

  if (system.status !== 'connected') {
    throw new Error('ERP system is not connected');
  }

  // Simulate API call
  console.log(`Triggering sync for ERP system: ${system.name}`);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const newSync: SyncResult = {
    id: Math.random().toString(36).substr(2, 9),
    erpSystemId,
    timestamp: new Date().toISOString(),
    status: 'success',
    recordsProcessed: Math.floor(Math.random() * 1000) + 500,
    recordsSuccessful: Math.floor(Math.random() * 1000) + 500,
    recordsFailed: Math.floor(Math.random() * 10),
    duration: Math.floor(Math.random() * 60) + 30
  };

  newSync.recordsSuccessful = newSync.recordsProcessed - newSync.recordsFailed;
  
  if (newSync.recordsFailed > 0) {
    newSync.status = 'partial';
    newSync.errors = [
      'Invalid material code detected',
      'Missing packaging data for some products'
    ];
  }

  mockSyncHistory.unshift(newSync);
  
  // Update last sync time
  system.lastSync = newSync.timestamp;

  return newSync;
};

export const testConnection = async (erpSystemId: string): Promise<boolean> => {
  const system = getERPSystemById(erpSystemId);
  if (!system) {
    throw new Error('ERP system not found');
  }

  console.log(`Testing connection to ${system.name}...`);
  
  // Simulate API test
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Random success/failure for demo
  const success = Math.random() > 0.2;
  
  if (success) {
    system.status = 'connected';
  } else {
    system.status = 'error';
  }

  return success;
};

export const updateERPSystem = (id: string, updates: Partial<ERPSystem>): ERPSystem | null => {
  const system = mockERPSystems.find(s => s.id === id);
  if (system) {
    Object.assign(system, updates);
    return system;
  }
  return null;
};

export const getERPStats = () => {
  const systems = getERPSystems();
  const recentSyncs = getSyncHistory().slice(0, 10);
  
  return {
    totalSystems: systems.length,
    connectedSystems: systems.filter(s => s.status === 'connected').length,
    lastSyncTime: recentSyncs[0]?.timestamp,
    totalRecordsToday: recentSyncs
      .filter(sync => {
        const today = new Date().toDateString();
        return new Date(sync.timestamp).toDateString() === today;
      })
      .reduce((sum, sync) => sum + sync.recordsProcessed, 0),
    successRate: recentSyncs.length > 0 
      ? (recentSyncs.filter(s => s.status === 'success').length / recentSyncs.length) * 100 
      : 0
  };
};
