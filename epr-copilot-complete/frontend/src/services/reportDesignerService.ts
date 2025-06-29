
import { CustomReport, ReportComponent, ReportFilter } from '../types/admin';

export class ReportDesignerService {
  private reports: Map<string, CustomReport> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockReport: CustomReport = {
      id: 'report-1',
      name: 'Compliance Dashboard',
      description: 'Overview of compliance metrics and performance',
      category: 'compliance',
      components: [
        {
          id: 'comp-1',
          name: 'Total Products',
          type: 'metric',
          position: { x: 0, y: 0, width: 3, height: 2 },
          config: {
            value: 1247,
            label: 'Total Products',
            trend: '+5.2%',
            color: 'blue'
          }
        },
        {
          id: 'comp-2',
          name: 'Fee Distribution',
          type: 'chart',
          position: { x: 3, y: 0, width: 6, height: 4 },
          config: {
            chartType: 'pie',
            dataSource: 'fees',
            title: 'Fee Distribution by Category'
          }
        }
      ],
      layout: 'grid',
      isPublic: false,
      createdBy: 'admin@company.com',
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
      tags: ['compliance', 'dashboard', 'overview']
    };

    this.reports.set(mockReport.id, mockReport);
  }

  getReports(): CustomReport[] {
    return Array.from(this.reports.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getReport(id: string): CustomReport | null {
    return this.reports.get(id) || null;
  }

  getReportsByCategory(category: string): CustomReport[] {
    return this.getReports().filter(report => report.category === category);
  }

  async createReport(reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomReport> {
    const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReport: CustomReport = {
      ...reportData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.reports.set(id, newReport);
    return newReport;
  }

  async updateReport(id: string, updates: Partial<CustomReport>): Promise<boolean> {
    const report = this.reports.get(id);
    if (!report) return false;

    Object.assign(report, updates, { updatedAt: new Date().toISOString() });
    return true;
  }

  async deleteReport(id: string): Promise<boolean> {
    return this.reports.delete(id);
  }

  async addComponent(reportId: string, component: Omit<ReportComponent, 'id'>): Promise<boolean> {
    const report = this.reports.get(reportId);
    if (!report) return false;

    const newComponent: ReportComponent = {
      ...component,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    report.components.push(newComponent);
    report.updatedAt = new Date().toISOString();
    return true;
  }

  async updateComponent(reportId: string, componentId: string, updates: Partial<ReportComponent>): Promise<boolean> {
    const report = this.reports.get(reportId);
    if (!report) return false;

    const componentIndex = report.components.findIndex(c => c.id === componentId);
    if (componentIndex === -1) return false;

    Object.assign(report.components[componentIndex], updates);
    report.updatedAt = new Date().toISOString();
    return true;
  }

  async removeComponent(reportId: string, componentId: string): Promise<boolean> {
    const report = this.reports.get(reportId);
    if (!report) return false;

    const componentIndex = report.components.findIndex(c => c.id === componentId);
    if (componentIndex === -1) return false;

    report.components.splice(componentIndex, 1);
    report.updatedAt = new Date().toISOString();
    return true;
  }

  getComponentTypes(): Array<{ value: string; label: string; description: string; icon: string }> {
    return [
      { value: 'metric', label: 'Metric Card', description: 'Display single metric with trend', icon: 'TrendingUp' },
      { value: 'chart', label: 'Chart', description: 'Various chart types (bar, line, pie)', icon: 'BarChart' },
      { value: 'table', label: 'Data Table', description: 'Tabular data display', icon: 'Table' },
      { value: 'text', label: 'Text Block', description: 'Rich text content', icon: 'Type' },
      { value: 'image', label: 'Image', description: 'Image or logo display', icon: 'Image' },
      { value: 'divider', label: 'Divider', description: 'Section separator', icon: 'Minus' }
    ];
  }

  getDataSources(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'products', label: 'Products', description: 'Product catalog data' },
      { value: 'materials', label: 'Materials', description: 'Material library data' },
      { value: 'fees', label: 'Fees', description: 'Fee calculation data' },
      { value: 'reports', label: 'Reports', description: 'Report submission data' },
      { value: 'analytics', label: 'Analytics', description: 'Analytics and metrics data' }
    ];
  }

  async duplicateReport(id: string, newName: string, createdBy: string): Promise<CustomReport | null> {
    const originalReport = this.reports.get(id);
    if (!originalReport) return null;

    const duplicatedReport: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'> = {
      ...originalReport,
      name: newName,
      createdBy
    };

    return await this.createReport(duplicatedReport);
  }

  exportReport(id: string): string | null {
    const report = this.reports.get(id);
    if (!report) return null;

    return JSON.stringify(report, null, 2);
  }

  async importReport(reportData: string, createdBy: string): Promise<CustomReport | null> {
    try {
      const parsedReport = JSON.parse(reportData);
      const reportToImport: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'> = {
        ...parsedReport,
        createdBy
      };

      return await this.createReport(reportToImport);
    } catch (error) {
      console.error('Failed to import report:', error);
      return null;
    }
  }
}

export const reportDesignerService = new ReportDesignerService();
