
import { ReportProduct } from './reportService';

export interface EnhancedReportSummary {
  totalProducts: number;
  totalWeight: number;
  totalUnits: number;
  recyclablePercentage: number;
  materialBreakdown: Record<string, number>;
  complianceScore: number;
  sustainabilityMetrics: {
    postconsumerContent: number;
    reusablePackaging: number;
    biodegradableContent: number;
  };
  regionalCompliance: Record<string, boolean>;
}

export function calculateEnhancedSummary(products: ReportProduct[]): EnhancedReportSummary {
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.unitsSold, 0);
  const totalWeight = products.reduce((sum, p) => sum + p.totalWeight, 0);
  
  const materialBreakdown: Record<string, number> = {};
  let recyclableWeight = 0;
  let postconsumerWeight = 0;
  let reusableWeight = 0;
  let biodegradableWeight = 0;
  
  products.forEach(product => {
    product.materials.forEach(material => {
      materialBreakdown[material.type] = (materialBreakdown[material.type] || 0) + material.weight;
      
      if (material.recyclable) {
        recyclableWeight += material.weight;
      }
    });
  });
  
  const recyclablePercentage = totalWeight > 0 ? recyclableWeight / totalWeight : 0;
  const complianceScore = Math.min(100, recyclablePercentage * 100 + 20);
  
  return {
    totalProducts,
    totalWeight,
    totalUnits,
    recyclablePercentage,
    materialBreakdown,
    complianceScore,
    sustainabilityMetrics: {
      postconsumerContent: postconsumerWeight / totalWeight,
      reusablePackaging: reusableWeight / totalWeight,
      biodegradableContent: biodegradableWeight / totalWeight
    },
    regionalCompliance: {
      oregon: complianceScore >= 70,
      california: complianceScore >= 75
    }
  };
}
