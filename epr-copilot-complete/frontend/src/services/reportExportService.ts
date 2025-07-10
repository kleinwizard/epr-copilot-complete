
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][];
      body?: string[][];
      startY?: number;
      theme?: string;
      styles?: { fontSize?: number };
    }) => jsPDF;
  }
}

export interface ExportData {
  companyName?: string;
  jurisdiction?: string;
  reportingPeriod?: string;
  reportId?: string;
  totalPackagingWeight?: number;
  baseFee?: number;
  ecoModulationAdjustments?: number;
  totalFeeOwed?: number;
  materialBreakdown?: Array<{
    materialClass: string;
    materialType: string;
    weight: number;
    feeRate: number;
    feeSubtotal: number;
  }>;
  costBreakdown?: Array<{
    materialType: string;
    totalWeight: number;
    totalCost: number;
    avgCostPerKg: number;
  }>;
  products?: Array<{
    productId: string;
    productName: string;
    componentName: string;
    materialCategory: string;
    weightPerUnit: number;
    recyclable: boolean;
    eprRate: number;
    totalFee: number;
  }>;
  materials?: Array<{
    materialId: string;
    materialName: string;
    category: string;
    recyclabilityPercentage: number;
    feeRate: number;
  }>;
  auditLogs?: Array<{
    timestamp: string;
    userEmail: string;
    action: string;
    ipAddress: string;
    status: string;
  }>;
}

export function exportComplianceReport(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Official EPR Compliance Report', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'N/A'}`, 20, 50);
  doc.text(`Jurisdiction: ${data.jurisdiction || 'N/A'}`, 20, 60);
  doc.text(`Reporting Period: ${data.reportingPeriod || 'N/A'}`, 20, 70);
  
  const summaryData = [
    ['Total Packaging Placed on Market (kg)', (data.totalPackagingWeight || 0).toLocaleString()],
    ['Base Fee ($)', (data.baseFee || 0).toLocaleString()],
    ['Eco-Modulation Adjustments ($)', (data.ecoModulationAdjustments || 0).toLocaleString()],
    ['Total Fee Owed ($)', (data.totalFeeOwed || 0).toLocaleString()]
  ];
  
  doc.autoTable({
    head: [['Summary', 'Value']],
    body: summaryData,
    startY: 90,
    theme: 'grid'
  });
  
  if (data.materialBreakdown && data.materialBreakdown.length > 0) {
    const materialData = data.materialBreakdown.map(item => [
      item.materialClass,
      item.materialType,
      `${item.weight.toLocaleString()}kg`,
      `$${item.feeRate.toFixed(2)}`,
      `$${item.feeSubtotal.toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Material Class', 'Material Type', 'Weight (kg)', 'Fee Rate ($/kg)', 'Fee Subtotal ($)']],
      body: materialData,
      startY: 150,
      theme: 'grid'
    });
  }
  
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, pageHeight - 30);
  doc.text(`Report ID: ${data.reportId || 'N/A'}`, 20, pageHeight - 20);
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function exportCostAnalysis(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('EPR Cost Analysis', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'N/A'}`, 20, 50);
  doc.text(`Reporting Period: ${data.reportingPeriod || 'N/A'}`, 20, 60);
  
  doc.setFontSize(14);
  doc.text('Cost Breakdown by Material', 20, 90);
  
  if (data.costBreakdown && data.costBreakdown.length > 0) {
    const costData = data.costBreakdown.map(item => [
      item.materialType,
      `${item.totalWeight.toLocaleString()}`,
      `$${item.totalCost.toLocaleString()}`,
      `$${item.avgCostPerKg.toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Material Type', 'Total Weight (kg)', 'Total Cost ($)', 'Avg Cost/kg ($)']],
      body: costData,
      startY: 100,
      theme: 'grid'
    });
  }
  
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, pageHeight - 20);
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function exportFullDataAudit(data: ExportData): Blob {
  const headers = [
    'product_id',
    'product_name', 
    'component_name',
    'material_id',
    'material_category',
    'component_weight_grams',
    'recyclable',
    'recycled_content_percentage',
    'supplier_name',
    'supplier_location'
  ];
  
  const rows: string[] = [headers.join(',')];
  
  if (data.products && data.products.length > 0) {
    data.products.forEach(product => {
      const row = [
        `"${product.productId}"`,
        `"${product.productName}"`,
        `"${product.componentName}"`,
        `"${product.materialCategory}"`,
        `"${product.materialCategory}"`,
        (product.weightPerUnit * 1000).toString(),
        product.recyclable.toString(),
        '0',
        '"N/A"',
        '"N/A"'
      ];
      rows.push(row.join(','));
    });
  }
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'text/csv' });
}

export function exportProductCatalog(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Product Catalog Export', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'N/A'}`, 20, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, 60);
  
  if (data.products && data.products.length > 0) {
    const productData = data.products.map(product => [
      product.productId,
      product.productName,
      product.componentName,
      product.materialCategory,
      `${product.weightPerUnit}g`,
      product.recyclable ? 'Yes' : 'No',
      `$${product.eprRate.toFixed(4)}`,
      `$${product.totalFee.toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [['Product ID', 'Product Name', 'Component', 'Material', 'Weight', 'Recyclable', 'EPR Rate', 'Total Fee']],
      body: productData,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
  }
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function exportMaterialCatalog(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Material Catalog Export', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'N/A'}`, 20, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, 60);
  
  if (data.materials && data.materials.length > 0) {
    const materialData = data.materials.map(material => [
      material.materialId,
      material.materialName,
      material.category,
      `${material.recyclabilityPercentage}%`,
      `$${material.feeRate.toFixed(4)}`
    ]);
    
    doc.autoTable({
      head: [['Material ID', 'Material Name', 'Category', 'Recyclability %', 'Fee Rate ($/kg)']],
      body: materialData,
      startY: 80,
      theme: 'grid'
    });
  }
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function exportSecurityAuditLog(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Security Audit Log', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Company Name: ${data.companyName || 'N/A'}`, 20, 50);
  doc.text(`Date Range: ${data.reportingPeriod || 'N/A'}`, 20, 60);
  
  if (data.auditLogs && data.auditLogs.length > 0) {
    const auditData = data.auditLogs.map(log => [
      log.timestamp,
      log.userEmail,
      log.action,
      log.ipAddress,
      log.status
    ]);
    
    doc.autoTable({
      head: [['Timestamp', 'User Email', 'Action', 'IP Address', 'Status']],
      body: auditData,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 8 }
    });
  }
  
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 20, pageHeight - 20);
  
  return new Blob([doc.output('blob')], { type: 'application/pdf' });
}

export function exportEnhancedReport(report: any, format: string): Blob {
  const exportData: ExportData = {
    companyName: report.companyName || "Sample Company",
    jurisdiction: report.jurisdiction || "California (SB 54)",
    reportingPeriod: `${report.quarter} ${report.year}`,
    reportId: `RPT-${report.id}`,
    totalPackagingWeight: report.summary?.totalWeight || 0,
    baseFee: report.fees?.baseFee || 0,
    ecoModulationAdjustments: report.fees?.adjustments || 0,
    totalFeeOwed: report.fees?.totalDue || 0,
    materialBreakdown: report.materials || [],
    products: report.products || [],
    costBreakdown: report.costBreakdown || []
  };

  if (format === 'pdf') {
    return exportComplianceReport(exportData);
  } else if (format === 'csv') {
    return exportFullDataAudit(exportData);
  } else if (format === 'excel') {
    return exportToExcel(exportData);
  }
  
  return exportComplianceReport(exportData);
}

export function exportToExcel(data: ExportData): Blob {
  const headers = [
    'Product ID', 'Product Name', 'Material Type', 'Weight (kg)', 
    'Recyclable', 'Fee Rate ($/kg)', 'Total Fee ($)'
  ];
  
  const rows = [headers.join(',')];
  
  if (data.products && data.products.length > 0) {
    data.products.forEach(product => {
      const row = [
        product.productId,
        `"${product.productName}"`,
        `"${product.materialCategory}"`,
        product.weightPerUnit.toString(),
        product.recyclable ? 'Yes' : 'No',
        product.eprRate.toFixed(4),
        product.totalFee.toFixed(2)
      ];
      rows.push(row.join(','));
    });
  }
  
  const csvContent = rows.join('\n');
  return new Blob([csvContent], { type: 'application/vnd.ms-excel' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
