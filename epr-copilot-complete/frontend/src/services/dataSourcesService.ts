
export interface DataSource {
  id: string;
  name: string;
  type: 'manual' | 'csv' | 'api' | 'erp';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export const availableDataSources: DataSource[] = [
  {
    id: 'manual',
    name: 'Manual Entry',
    type: 'manual',
    status: 'connected'
  },
  {
    id: 'erp-sap',
    name: 'SAP ERP System',
    type: 'erp',
    status: 'disconnected'
  },
  {
    id: 'csv-import',
    name: 'CSV Import',
    type: 'csv',
    status: 'connected',
    lastSync: '2024-06-24 10:30'
  }
];

export function getDataSourceById(id: string): DataSource | undefined {
  return availableDataSources.find(source => source.id === id);
}

export function getConnectedDataSources(): DataSource[] {
  return availableDataSources.filter(source => source.status === 'connected');
}
