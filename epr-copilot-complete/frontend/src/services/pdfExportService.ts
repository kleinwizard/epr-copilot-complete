
interface CompanyInfo {
  name: string;
  jurisdiction: string;
  reportingPeriod: string;
}

interface ComplianceReportData {
  company: CompanyInfo;
  summary: {
    totalPackagingWeight: number;
    baseFee: number;
    ecoModulationAdjustments: number;
    totalFeeOwed: number;
  };
  materialBreakdown: Array<{
    materialClass: string;
    materialType: string;
    weight: number;
    feeRate: number;
    feeSubtotal: number;
  }>;
}

interface CostAnalysisData {
  company: CompanyInfo;
  costsByJurisdiction: Array<{ jurisdiction: string; cost: number }>;
  topProductsByCost: Array<{ product: string; cost: number }>;
  materialCostBreakdown: Array<{
    materialType: string;
    totalWeight: number;
    totalCost: number;
    avgCostPerKg: number;
  }>;
}

interface SecurityAuditData {
  company: CompanyInfo;
  dateRange: string;
  events: Array<{
    timestamp: string;
    userEmail: string;
    action: string;
    ipAddress: string;
    status: string;
  }>;
}

interface CatalogData {
  title: string;
  items: Array<Record<string, any>>;
  columns: Array<{ key: string; label: string }>;
}

export class PDFExportService {
  private generateHTMLContent(title: string, content: string, company?: CompanyInfo, reportId?: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 15px; }
            .company-info { font-size: 14px; color: #374151; }
            .company-info div { margin-bottom: 5px; }
            .content { margin-bottom: 40px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin: 25px 0 15px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
            .table th { background-color: #f3f4f6; font-weight: bold; }
            .table tr:nth-child(even) { background-color: #f9fafb; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #6b7280; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .summary-item { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .summary-label { font-weight: bold; color: #374151; }
            .summary-value { font-size: 18px; color: #1e40af; margin-top: 5px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            ${company ? `
              <div class="company-info">
                <div><strong>Company Name:</strong> ${company.name}</div>
                ${company.jurisdiction ? `<div><strong>Jurisdiction:</strong> ${company.jurisdiction}</div>` : ''}
                ${company.reportingPeriod ? `<div><strong>Reporting Period:</strong> ${company.reportingPeriod}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div>Generated On: ${currentDate}</div>
            ${reportId ? `<div>Report ID: ${reportId}</div>` : ''}
          </div>
        </body>
      </html>
    `;
  }
  
  private async printToPDF(htmlContent: string, filename: string): Promise<Blob> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups for this site.');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    await new Promise(resolve => {
      printWindow.onload = resolve;
      setTimeout(resolve, 1000); // Fallback timeout
    });
    
    printWindow.print();
    
    return new Blob([htmlContent], { type: 'text/html' });
  }

  async generateComplianceReport(data: ComplianceReportData): Promise<Blob> {
    const reportId = `RPT-${Date.now()}`;
    
    const summaryContent = `
      <div class="section-title">Summary</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total Packaging Placed on Market (kg)</div>
          <div class="summary-value">${data.summary.totalPackagingWeight.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Base Fee ($)</div>
          <div class="summary-value">$${data.summary.baseFee.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Eco-Modulation Adjustments ($)</div>
          <div class="summary-value">$${data.summary.ecoModulationAdjustments.toFixed(2)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label"><strong>Total Fee Owed ($)</strong></div>
          <div class="summary-value"><strong>$${data.summary.totalFeeOwed.toFixed(2)}</strong></div>
        </div>
      </div>
      
      <div class="section-title">Material Breakdown</div>
      <table class="table">
        <thead>
          <tr>
            <th>Material Class</th>
            <th>Material Type</th>
            <th>Weight (kg)</th>
            <th>Fee Rate ($/kg)</th>
            <th>Fee Subtotal ($)</th>
          </tr>
        </thead>
        <tbody>
          ${data.materialBreakdown.map(item => `
            <tr>
              <td>${item.materialClass}</td>
              <td>${item.materialType}</td>
              <td>${item.weight.toLocaleString()}</td>
              <td>$${item.feeRate.toFixed(4)}</td>
              <td>$${item.feeSubtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const htmlContent = this.generateHTMLContent('Official EPR Compliance Report', summaryContent, data.company, reportId);
    return this.printToPDF(htmlContent, `compliance_report_${reportId}.pdf`);
  }

  async generateCostAnalysisReport(data: CostAnalysisData): Promise<Blob> {
    const content = `
      <div class="section-title">Cost Breakdown by Material</div>
      <table class="table">
        <thead>
          <tr>
            <th>Material Type</th>
            <th>Total Weight (kg)</th>
            <th>Total Cost ($)</th>
            <th>Avg Cost/kg ($)</th>
          </tr>
        </thead>
        <tbody>
          ${data.materialCostBreakdown.map(item => `
            <tr>
              <td>${item.materialType}</td>
              <td>${item.totalWeight.toLocaleString()}</td>
              <td>$${item.totalCost.toFixed(2)}</td>
              <td>$${item.avgCostPerKg.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="section-title">Top 10 Products by EPR Cost</div>
      <table class="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product</th>
            <th>EPR Cost ($)</th>
          </tr>
        </thead>
        <tbody>
          ${data.topProductsByCost.slice(0, 10).map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.product}</td>
              <td>$${item.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const htmlContent = this.generateHTMLContent('EPR Cost Analysis', content, data.company);
    return this.printToPDF(htmlContent, 'cost_analysis_report.pdf');
  }

  async generateSecurityAuditLog(data: SecurityAuditData): Promise<Blob> {
    const company = { ...data.company, reportingPeriod: data.dateRange };
    
    const content = `
      <table class="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User Email</th>
            <th>Action</th>
            <th>IP Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.events.map(event => `
            <tr>
              <td>${event.timestamp}</td>
              <td>${event.userEmail}</td>
              <td>${event.action}</td>
              <td>${event.ipAddress}</td>
              <td>${event.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const htmlContent = this.generateHTMLContent('Security Audit Log', content, company);
    return this.printToPDF(htmlContent, 'security_audit_log.pdf');
  }

  async generateCatalogExport(data: CatalogData): Promise<Blob> {
    const content = `
      <table class="table">
        <thead>
          <tr>
            ${data.columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              ${data.columns.map(col => `<td>${item[col.key]?.toString() || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const htmlContent = this.generateHTMLContent(data.title, content);
    return this.printToPDF(htmlContent, `${data.title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  }
}

export const pdfExportService = new PDFExportService();
