interface CSVExportData {
  headers: string[];
  rows: Array<Array<string | number | boolean>>;
  filename: string;
}

interface ProductCatalogItem {
  product_id: string;
  product_name: string;
  component_name: string;
  component_weight_grams: number;
  material_type: string;
  material_subtype?: string;
  color?: string;
  recyclable: boolean;
  post_consumer_recycled_content_percent: number;
  bio_based_content_percent: number;
  compostable: boolean;
  reusable: boolean;
  units_sold_california?: number;
  units_sold_oregon?: number;
  units_sold_maine?: number;
  units_sold_colorado?: number;
  units_sold_maryland?: number;
}

export class CSVExportService {
  private escapeCSVField(field: any): string {
    if (field === null || field === undefined) {
      return '';
    }
    
    const stringField = field.toString();
    
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  }

  private generateCSVContent(data: CSVExportData): string {
    const lines: string[] = [];
    
    lines.push(data.headers.map(header => this.escapeCSVField(header)).join(','));
    
    data.rows.forEach(row => {
      lines.push(row.map(cell => this.escapeCSVField(cell)).join(','));
    });
    
    return lines.join('\n');
  }

  generateFullDataAudit(products: ProductCatalogItem[], companyName: string): Blob {
    const headers = [
      'product_id',
      'product_name', 
      'component_name',
      'component_weight_grams',
      'material_type',
      'material_subtype',
      'color',
      'recyclable',
      'post_consumer_recycled_content_percent',
      'bio_based_content_percent',
      'compostable',
      'reusable',
      'units_sold_california',
      'units_sold_oregon',
      'units_sold_maine',
      'units_sold_colorado',
      'units_sold_maryland'
    ];

    const rows = products.map(product => [
      product.product_id,
      product.product_name,
      product.component_name,
      product.component_weight_grams,
      product.material_type,
      product.material_subtype || '',
      product.color || '',
      product.recyclable,
      product.post_consumer_recycled_content_percent,
      product.bio_based_content_percent,
      product.compostable,
      product.reusable,
      product.units_sold_california || 0,
      product.units_sold_oregon || 0,
      product.units_sold_maine || 0,
      product.units_sold_colorado || 0,
      product.units_sold_maryland || 0
    ]);

    const csvData: CSVExportData = {
      headers,
      rows,
      filename: `data_audit_${companyName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`
    };

    const csvContent = this.generateCSVContent(csvData);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  generateProductCatalogExport(products: any[]): Blob {
    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Total Weight (g)',
      'Material Count',
      'Recyclable Components',
      'PCR Content (%)',
      'Created Date',
      'Last Updated'
    ];

    const rows = products.map(product => [
      product.id || product.sku,
      product.name,
      product.category,
      product.totalWeight || 0,
      product.materials?.length || 0,
      product.materials?.filter((m: any) => m.recyclable).length || 0,
      product.averagePCRContent || 0,
      product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '',
      product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : ''
    ]);

    const csvData: CSVExportData = {
      headers,
      rows,
      filename: `product_catalog_export_${new Date().toISOString().split('T')[0]}.csv`
    };

    const csvContent = this.generateCSVContent(csvData);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  generateMaterialCatalogExport(materials: any[]): Blob {
    const headers = [
      'Material ID',
      'Material Type',
      'Subtype',
      'Density (g/cm³)',
      'Recyclable',
      'PCR Content (%)',
      'Bio-based Content (%)',
      'Compostable',
      'EPR Rate ($/kg)',
      'Created Date'
    ];

    const rows = materials.map(material => [
      material.id,
      material.type,
      material.subtype || '',
      material.density || 0,
      material.recyclable,
      material.pcrContent || 0,
      material.bioBasedContent || 0,
      material.compostable,
      material.eprRate || 0,
      material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ''
    ]);

    const csvData: CSVExportData = {
      headers,
      rows,
      filename: `material_catalog_export_${new Date().toISOString().split('T')[0]}.csv`
    };

    const csvContent = this.generateCSVContent(csvData);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  generateComplianceDataExport(complianceData: any[]): Blob {
    const headers = [
      'Jurisdiction',
      'Reporting Period',
      'Total Weight (kg)',
      'Base Fee ($)',
      'Eco-modulation Adjustments ($)',
      'Total Fee ($)',
      'Payment Status',
      'Due Date',
      'Submitted Date'
    ];

    const rows = complianceData.map(data => [
      data.jurisdiction,
      data.reportingPeriod,
      data.totalWeight,
      data.baseFee,
      data.ecoModulationAdjustments,
      data.totalFee,
      data.paymentStatus,
      data.dueDate ? new Date(data.dueDate).toLocaleDateString() : '',
      data.submittedDate ? new Date(data.submittedDate).toLocaleDateString() : ''
    ]);

    const csvData: CSVExportData = {
      headers,
      rows,
      filename: `compliance_data_export_${new Date().toISOString().split('T')[0]}.csv`
    };

    const csvContent = this.generateCSVContent(csvData);
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  downloadCSV(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const csvExportService = new CSVExportService();
