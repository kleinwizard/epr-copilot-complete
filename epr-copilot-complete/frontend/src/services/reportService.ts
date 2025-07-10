
import { APP_CONFIG } from '../../config/constants';
import { authService } from './authService';

export interface QuarterlyReport {
  id: string;
  quarter: string;
  year: number;
  status: 'Draft' | 'Submitted' | 'Overdue';
  createdDate: string;
  submissionDate?: string;
  dueDate: string;
  products: ReportProduct[];
  summary: ReportSummary;
  fees: ReportFees;
}

export interface ReportProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  totalWeight: number;
  materials: ReportMaterial[];
  unitsSold: number;
  totalFee: number;
}

export interface ReportMaterial {
  type: string;
  weight: number;
  recyclable: boolean;
  eprRate: number;
  fee: number;
}

export interface ReportSummary {
  totalProducts: number;
  totalWeight: number;
  totalUnits: number;
  recyclablePercentage: number;
  materialBreakdown: { [key: string]: number };
}

export interface ReportFees {
  totalBaseFee: number;
  recyclabilityDiscount: number;
  totalDue: number;
  paymentStatus: 'Pending' | 'Paid' | 'Overdue';
}


export async function getQuarterlyReports(): Promise<QuarterlyReport[]> {
  const token = authService.getAccessToken();
  const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/reports`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  
  const reports = await response.json();
  
  return reports.map((report: any) => ({
    id: report.period || report.id,
    quarter: report.period?.split('-')[0] || 'Q1',
    year: parseInt(report.period?.split('-')[1]) || new Date().getFullYear(),
    status: report.status === 'submitted' ? 'Submitted' : report.status === 'draft' ? 'Draft' : 'Overdue',
    createdDate: report.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0], // Calculate based on quarter
    products: [], // Would be populated from related data
    summary: {
      totalProducts: 0,
      totalWeight: 0,
      totalUnits: 0,
      recyclablePercentage: 0,
      materialBreakdown: {}
    },
    fees: {
      totalBaseFee: report.total_fee || 0,
      recyclabilityDiscount: 0,
      totalDue: report.total_fee || 0,
      paymentStatus: 'Pending'
    }
  }));
}

export async function getReportById(id: string): Promise<QuarterlyReport | undefined> {
  const token = authService.getAccessToken();
  const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/reports/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return undefined;
    }
    throw new Error('Failed to fetch report');
  }
  
  const report = await response.json();
  
  return {
    id: report.period || report.id,
    quarter: report.period?.split('-')[0] || 'Q1',
    year: parseInt(report.period?.split('-')[1]) || new Date().getFullYear(),
    status: report.status === 'submitted' ? 'Submitted' : report.status === 'draft' ? 'Draft' : 'Overdue',
    createdDate: report.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    products: [],
    summary: {
      totalProducts: 0,
      totalWeight: 0,
      totalUnits: 0,
      recyclablePercentage: 0,
      materialBreakdown: {}
    },
    fees: {
      totalBaseFee: report.total_fee || 0,
      recyclabilityDiscount: 0,
      totalDue: report.total_fee || 0,
      paymentStatus: 'Pending'
    }
  };
}

export async function createNewReport(quarter: string, year: number): Promise<QuarterlyReport> {
  const token = authService.getAccessToken();
  const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/reports/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quarter, year }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create report');
  }
  
  const report = await response.json();
  const id = `${quarter}-${year}`;
  const dueDate = new Date(year, getQuarterEndMonth(quarter), 30);
  
  return {
    id,
    quarter,
    year,
    status: 'Draft',
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    products: [],
    summary: {
      totalProducts: 0,
      totalWeight: 0,
      totalUnits: 0,
      recyclablePercentage: 0,
      materialBreakdown: {}
    },
    fees: {
      totalBaseFee: 0,
      recyclabilityDiscount: 0,
      totalDue: 0,
      paymentStatus: 'Pending'
    }
  };
}

function getQuarterEndMonth(quarter: string): number {
  switch (quarter) {
    case 'Q1': return 3; // April
    case 'Q2': return 6; // July
    case 'Q3': return 9; // October
    case 'Q4': return 0; // January (next year)
    default: return 3;
  }
}

export function exportReportToCSV(report: QuarterlyReport): string {
  const headers = ['Product Name', 'SKU', 'Category', 'Units Sold', 'Total Weight (g)', 'Total Fee ($)'];
  const rows = report.products.map(product => [
    product.name,
    product.sku,
    product.category,
    product.unitsSold.toString(),
    product.totalWeight.toString(),
    product.totalFee.toFixed(2)
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
