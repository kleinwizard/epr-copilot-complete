import { apiService } from './apiService';

export interface ComplianceMetrics {
  companyProfileComplete: boolean;
  materialsCount: number;
  productsCount: number;
  salesDataComplete: boolean;
  reportsGenerated: number;
  feesOrProMembershipActive: boolean;
}

export interface ComplianceCalculation {
  overallScore: number;
  breakdown: {
    companyProfile: { score: number; weight: number; complete: boolean };
    materials: { score: number; weight: number; count: number };
    products: { score: number; weight: number; count: number };
    salesData: { score: number; weight: number; complete: boolean };
    reports: { score: number; weight: number; count: number };
    fees: { score: number; weight: number; active: boolean };
  };
}

class ComplianceCalculationService {
  private readonly weights = {
    companyProfile: 10,
    materials: 20,
    products: 20,
    salesData: 25,
    reports: 15,
    fees: 10
  };

  async calculateComplianceScore(): Promise<ComplianceCalculation> {
    try {
      const metrics = await this.gatherComplianceMetrics();
      return this.computeScore(metrics);
    } catch (error) {
      console.error('Failed to calculate compliance score:', error);
      return this.getDefaultScore();
    }
  }

  private async gatherComplianceMetrics(): Promise<ComplianceMetrics> {
    const [companyInfo, materials, products, analytics] = await Promise.all([
      apiService.getCompanyInfo(),
      apiService.getMaterials(),
      apiService.getProducts(),
      apiService.getAnalytics()
    ]);

    const companyProfileComplete = this.isCompanyProfileComplete(companyInfo);
    const materialsCount = materials?.length || 0;
    const productsCount = products?.length || 0;
    const salesDataComplete = this.isSalesDataComplete(analytics);
    const reportsGenerated = this.getReportsGeneratedCount(analytics);
    const feesOrProMembershipActive = this.isFeesOrProMembershipActive(analytics);

    return {
      companyProfileComplete,
      materialsCount,
      productsCount,
      salesDataComplete,
      reportsGenerated,
      feesOrProMembershipActive
    };
  }

  private computeScore(metrics: ComplianceMetrics): ComplianceCalculation {
    const companyProfileScore = metrics.companyProfileComplete ? this.weights.companyProfile : 0;
    const materialsScore = metrics.materialsCount > 0 ? this.weights.materials : 0;
    const productsScore = metrics.productsCount > 0 ? this.weights.products : 0;
    const salesDataScore = metrics.salesDataComplete ? this.weights.salesData : 0;
    const reportsScore = metrics.reportsGenerated > 0 ? this.weights.reports : 0;
    const feesScore = metrics.feesOrProMembershipActive ? this.weights.fees : 0;

    const overallScore = companyProfileScore + materialsScore + productsScore + 
                        salesDataScore + reportsScore + feesScore;

    return {
      overallScore,
      breakdown: {
        companyProfile: { 
          score: companyProfileScore, 
          weight: this.weights.companyProfile, 
          complete: metrics.companyProfileComplete 
        },
        materials: { 
          score: materialsScore, 
          weight: this.weights.materials, 
          count: metrics.materialsCount 
        },
        products: { 
          score: productsScore, 
          weight: this.weights.products, 
          count: metrics.productsCount 
        },
        salesData: { 
          score: salesDataScore, 
          weight: this.weights.salesData, 
          complete: metrics.salesDataComplete 
        },
        reports: { 
          score: reportsScore, 
          weight: this.weights.reports, 
          count: metrics.reportsGenerated 
        },
        fees: { 
          score: feesScore, 
          weight: this.weights.fees, 
          active: metrics.feesOrProMembershipActive 
        }
      }
    };
  }

  private isCompanyProfileComplete(companyInfo: any): boolean {
    if (!companyInfo) return false;
    
    const requiredFields = [
      'legalName', 'businessId', 'naicsCode', 'entityType', 
      'address', 'city', 'zipCode'
    ];
    
    const contactFields = [
      'primaryContact.firstName', 'primaryContact.lastName', 
      'primaryContact.email', 'primaryContact.phone'
    ];

    const hasRequiredFields = requiredFields.every(field => 
      companyInfo[field] && companyInfo[field].trim() !== ''
    );

    const hasContactFields = contactFields.every(field => {
      const value = this.getNestedValue(companyInfo, field);
      return value && value.trim() !== '';
    });

    return hasRequiredFields && hasContactFields;
  }

  private isSalesDataComplete(analytics: any): boolean {
    return analytics?.salesDataComplete === true || 
           (analytics?.totalProducts > 0 && analytics?.totalFees > 0);
  }

  private getReportsGeneratedCount(analytics: any): number {
    return analytics?.reportsGenerated || 0;
  }

  private isFeesOrProMembershipActive(analytics: any): boolean {
    return analytics?.feesOrProMembershipActive === true ||
           analytics?.proMembershipActive === true ||
           analytics?.feesPaid === true;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getDefaultScore(): ComplianceCalculation {
    return {
      overallScore: 0,
      breakdown: {
        companyProfile: { score: 0, weight: this.weights.companyProfile, complete: false },
        materials: { score: 0, weight: this.weights.materials, count: 0 },
        products: { score: 0, weight: this.weights.products, count: 0 },
        salesData: { score: 0, weight: this.weights.salesData, complete: false },
        reports: { score: 0, weight: this.weights.reports, count: 0 },
        fees: { score: 0, weight: this.weights.fees, active: false }
      }
    };
  }
}

export const complianceCalculationService = new ComplianceCalculationService();
