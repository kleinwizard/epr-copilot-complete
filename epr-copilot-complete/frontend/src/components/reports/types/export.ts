
export interface ExportJob {
  id: string;
  name: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
}

export interface AvailableReport {
  id: string;
  name: string;
  status: string;
}

export interface ExportFormat {
  value: string;
  label: string;
  icon: any;
  description: string;
}
