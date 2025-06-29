import { QuarterlyReport, ReportProduct } from './reportService';
import { calculateEnhancedEprFee, EnhancedMaterial } from './enhancedFeeCalculation';
import { validateReport, ReportValidation } from './reportValidationService';
import { calculateEnhancedSummary, EnhancedReportSummary } from './reportSummaryService';
import { calculateDueDate } from './reportUtilsService';

export { availableDataSources } from './dataSourcesService';
export { exportEnhancedReport } from './reportExportService';
export type { DataSource } from './dataSourcesService';
export type { ReportValidation } from './reportValidationService';
export type { EnhancedReportSummary } from './reportSummaryService';

export function generateEnhancedReport(
  quarter: string,
  year: number,
  products: ReportProduct[],
  region: string = 'oregon'
): QuarterlyReport {
  const enhancedProducts = products.map(product => {
    const enhancedMaterials: EnhancedMaterial[] = product.materials.map(material => ({
      type: material.type,
      weight: material.weight,
      recyclable: material.recyclable,
      postconsumerContent: Math.random() > 0.5 ? 0.25 + Math.random() * 0.5 : 0,
      isReusable: material.type.includes('Glass') || material.type.includes('Metal'),
      biodegradable: material.type.includes('Paper') || material.type.includes('Cardboard')
    }));
    
    const calculation = calculateEnhancedEprFee(enhancedMaterials, region, product.unitsSold);
    
    return {
      ...product,
      totalFee: calculation.totalFee,
      materials: calculation.materials.map(m => ({
        type: m.type,
        weight: m.weight,
        recyclable: m.recyclable,
        eprRate: m.adjustedRate,
        fee: m.fee
      }))
    };
  });
  
  const summary = calculateEnhancedSummary(enhancedProducts);
  const validation = validateReport(enhancedProducts);
  
  const report: QuarterlyReport = {
    id: `${quarter}-${year}`,
    quarter,
    year,
    status: validation.isValid ? 'Draft' : 'Draft',
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: calculateDueDate(quarter, year),
    products: enhancedProducts,
    summary,
    fees: {
      totalBaseFee: summary.materialBreakdown ? Object.values(summary.materialBreakdown).reduce((a, b) => a + b, 0) * 0.45 : 0,
      recyclabilityDiscount: summary.recyclablePercentage * 100,
      totalDue: enhancedProducts.reduce((sum, p) => sum + p.totalFee, 0),
      paymentStatus: 'Pending'
    }
  };
  
  return report;
}
