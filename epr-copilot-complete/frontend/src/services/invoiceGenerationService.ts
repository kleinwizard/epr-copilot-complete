
import { RealTimeCalculationResult } from './realTimeFeeCalculation';
import { Invoice } from './paymentProcessingService';

export interface InvoiceTemplate {
  id: string;
  name: string;
  logoUrl?: string;
  companyName: string;
  companyAddress: string;
  headerColor: string;
  footerText: string;
  terms: string;
}

export interface InvoiceCustomization {
  template: InvoiceTemplate;
  showDetailed: boolean;
  includeChart: boolean;
  includeSustainabilityNotes: boolean;
  language: 'en' | 'es' | 'fr';
}

export class InvoiceGenerationService {
  private templates: Map<string, InvoiceTemplate> = new Map();

  constructor() {
    // Initialize with default templates
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplate: InvoiceTemplate = {
      id: 'default',
      name: 'Standard EPR Invoice',
      companyName: 'EPR Compliance Solutions',
      companyAddress: '123 Green Street, Portland, OR 97201',
      headerColor: '#2563eb',
      footerText: 'Thank you for your commitment to environmental responsibility.',
      terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.'
    };

    const modernTemplate: InvoiceTemplate = {
      id: 'modern',
      name: 'Modern Eco Theme',
      companyName: 'EPR Compliance Solutions',
      companyAddress: '123 Green Street, Portland, OR 97201',
      headerColor: '#059669',
      footerText: 'Building a sustainable future together.',
      terms: 'Payment terms: Net 30. Questions? Contact support@epr-solutions.com'
    };

    this.templates.set(defaultTemplate.id, defaultTemplate);
    this.templates.set(modernTemplate.id, modernTemplate);
  }

  getTemplates(): InvoiceTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(templateId: string): InvoiceTemplate | null {
    return this.templates.get(templateId) || null;
  }

  generateInvoiceHtml(
    invoice: Invoice,
    customization: InvoiceCustomization
  ): string {
    const template = customization.template;
    const calculation = invoice.feeCalculation;

    return `
<!DOCTYPE html>
<html lang="${customization.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background: ${template.headerColor};
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
            background: #f8f9fa;
        }
        .company-info h3,
        .invoice-info h3 {
            margin: 0 0 15px 0;
            color: ${template.headerColor};
        }
        .content {
            padding: 30px;
        }
        .fee-breakdown {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .material-item {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .material-item:last-child {
            border-bottom: none;
        }
        .material-info {
            flex: 1;
        }
        .material-name {
            font-weight: 600;
            color: #374151;
        }
        .material-details {
            font-size: 0.9em;
            color: #6b7280;
            margin-top: 5px;
        }
        .recyclable-badge {
            background: #d1fae5;
            color: #065f46;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .fee-amount {
            font-weight: 700;
            color: ${template.headerColor};
        }
        .totals {
            background: white;
            border: 2px solid ${template.headerColor};
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .total-row:last-child {
            border-bottom: none;
            font-size: 1.2em;
            font-weight: 700;
            color: ${template.headerColor};
        }
        .sustainability-notes {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            background: #f3f4f6;
            padding: 30px;
            text-align: center;
            color: #6b7280;
        }
        .terms {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            font-size: 0.9em;
        }
        @media print {
            body { padding: 0; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1>INVOICE</h1>
            <p>${invoice.invoiceNumber}</p>
        </div>
        
        <div class="invoice-details">
            <div class="company-info">
                <h3>From:</h3>
                <strong>${template.companyName}</strong><br>
                ${template.companyAddress.replace(/,/g, '<br>')}
            </div>
            <div class="invoice-info">
                <h3>Invoice Details:</h3>
                <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
                <strong>Issue Date:</strong> ${new Date(invoice.issuedDate).toLocaleDateString()}<br>
                <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>
                <strong>Status:</strong> <span style="text-transform: capitalize;">${invoice.status}</span>
            </div>
        </div>
        
        <div class="content">
            <h2>EPR Fee Calculation</h2>
            <p>Extended Producer Responsibility fees for packaging materials as calculated on ${new Date(calculation.lastUpdated).toLocaleDateString()}.</p>
            
            ${customization.showDetailed ? this.generateDetailedBreakdown(calculation) : this.generateSummaryBreakdown(calculation)}
            
            <div class="totals">
                <div class="total-row">
                    <span>Base Fee:</span>
                    <span>$${calculation.baseFee.toFixed(4)}</span>
                </div>
                <div class="total-row">
                    <span>Discounts Applied:</span>
                    <span>-$${calculation.discounts.toFixed(4)}</span>
                </div>
                <div class="total-row">
                    <span>Total Due:</span>
                    <span>$${calculation.totalFee.toFixed(2)}</span>
                </div>
            </div>
            
            ${customization.includeSustainabilityNotes ? this.generateSustainabilityNotes(calculation) : ''}
            
            <div class="terms">
                <h4>Payment Terms</h4>
                <p>${template.terms}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>${template.footerText}</p>
            <p style="font-size: 0.8em; margin-top: 10px;">
                Generated on ${new Date().toLocaleString()} | Questions? Contact support
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateDetailedBreakdown(calculation: RealTimeCalculationResult): string {
    return `
        <div class="fee-breakdown">
            <h3>Material Breakdown</h3>
            ${calculation.breakdown.map(material => `
                <div class="material-item">
                    <div class="material-info">
                        <div class="material-name">
                            ${material.type}
                            ${material.recyclable ? '<span class="recyclable-badge">Recyclable</span>' : ''}
                        </div>
                        <div class="material-details">
                            Weight: ${material.weight}g | Rate: $${material.adjustedRate.toFixed(4)}/kg
                        </div>
                    </div>
                    <div class="fee-amount">$${material.fee.toFixed(4)}</div>
                </div>
            `).join('')}
        </div>
    `;
  }

  private generateSummaryBreakdown(calculation: RealTimeCalculationResult): string {
    const totalMaterials = calculation.breakdown.length;
    const recyclableCount = calculation.breakdown.filter(m => m.recyclable).length;
    const totalWeight = calculation.breakdown.reduce((sum, m) => sum + m.weight, 0);

    return `
        <div class="fee-breakdown">
            <h3>Fee Summary</h3>
            <div class="material-item">
                <div class="material-info">
                    <div class="material-name">Total Materials</div>
                    <div class="material-details">${totalMaterials} materials, ${totalWeight}g total weight</div>
                </div>
                <div class="fee-amount">$${calculation.totalFee.toFixed(4)}</div>
            </div>
            <div class="material-item">
                <div class="material-info">
                    <div class="material-name">Recyclable Materials</div>
                    <div class="material-details">${recyclableCount} of ${totalMaterials} materials are recyclable</div>
                </div>
                <div class="fee-amount">-$${calculation.discounts.toFixed(4)}</div>
            </div>
        </div>
    `;
  }

  private generateSustainabilityNotes(calculation: RealTimeCalculationResult): string {
    const recyclablePercentage = (calculation.breakdown.filter(m => m.recyclable).length / calculation.breakdown.length) * 100;
    
    return `
        <div class="sustainability-notes">
            <h4>🌱 Sustainability Impact</h4>
            <p><strong>Recyclability:</strong> ${recyclablePercentage.toFixed(0)}% of your packaging materials are recyclable.</p>
            <p><strong>Discount Applied:</strong> You saved $${calculation.discounts.toFixed(4)} due to using recyclable materials.</p>
            <p><strong>Environmental Benefit:</strong> Your commitment to recyclable packaging helps reduce waste and supports circular economy principles.</p>
        </div>
    `;
  }

  generateInvoicePdf(invoice: Invoice, customization: InvoiceCustomization): Promise<Blob> {
    // This would typically use a PDF generation library like jsPDF or Puppeteer
    // For now, we'll simulate the process
    return new Promise((resolve) => {
      setTimeout(() => {
        const htmlContent = this.generateInvoiceHtml(invoice, customization);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        resolve(blob);
      }, 1000);
    });
  }

  downloadInvoice(invoice: Invoice, customization: InvoiceCustomization, format: 'html' | 'pdf' = 'html') {
    if (format === 'html') {
      const htmlContent = this.generateInvoiceHtml(invoice, customization);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // PDF generation would go here
      this.generateInvoicePdf(invoice, customization).then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }
  }

  previewInvoice(invoice: Invoice, customization: InvoiceCustomization): string {
    return this.generateInvoiceHtml(invoice, customization);
  }
}

export const invoiceGenerationService = new InvoiceGenerationService();
