
export interface AnalyticsData {
  overview: {
    totalFees: number;
    totalProducts: number;
    totalWeight: number;
    recyclabilityRate: number;
    quarterlyGrowth: number;
    costSavings: number;
  };
  feesTrend: Array<{
    month: string;
    fees: number;
    recyclabilityDiscount: number;
    netFees: number;
  }>;
  materialBreakdown: Array<{
    material: string;
    weight: number;
    percentage: number;
    fees: number;
    recyclable: boolean;
  }>;
  productCategories: Array<{
    category: string;
    products: number;
    fees: number;
    avgWeight: number;
  }>;
  quarterlyComparison: Array<{
    quarter: string;
    fees: number;
    weight: number;
    products: number;
    compliance: number;
  }>;
  sustainabilityMetrics: {
    recyclablePercentage: number;
    wasteReduction: number;
    carbonFootprint: number;
    circularityScore: number;
  };
}

// Mock analytics data
export const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalFees: 78450,
    totalProducts: 1247,
    totalWeight: 145600,
    recyclabilityRate: 73.2,
    quarterlyGrowth: 8.5,
    costSavings: 15680
  },
  feesTrend: [
    { month: 'Jan', fees: 18500, recyclabilityDiscount: 4625, netFees: 13875 },
    { month: 'Feb', fees: 19200, recyclabilityDiscount: 4800, netFees: 14400 },
    { month: 'Mar', fees: 21000, recyclabilityDiscount: 5250, netFees: 15750 },
    { month: 'Apr', fees: 19800, recyclabilityDiscount: 4950, netFees: 14850 },
    { month: 'May', fees: 22100, recyclabilityDiscount: 5525, netFees: 16575 },
    { month: 'Jun', fees: 23850, recyclabilityDiscount: 5963, netFees: 17888 }
  ],
  materialBreakdown: [
    { material: 'Plastic (PET)', weight: 45200, percentage: 31.0, fees: 20340, recyclable: true },
    { material: 'Glass', weight: 38500, percentage: 26.4, fees: 5775, recyclable: true },
    { material: 'Paper (Label)', weight: 28900, percentage: 19.8, fees: 3468, recyclable: true },
    { material: 'Metal (Aluminum)', weight: 18200, percentage: 12.5, fees: 3276, recyclable: true },
    { material: 'Plastic (LDPE)', weight: 14800, percentage: 10.2, fees: 9176, recyclable: false }
  ],
  productCategories: [
    { category: 'Food & Beverage', products: 485, fees: 28500, avgWeight: 125 },
    { category: 'Health & Beauty', products: 312, fees: 18200, avgWeight: 95 },
    { category: 'Household', products: 267, fees: 15800, avgWeight: 180 },
    { category: 'Electronics', products: 98, fees: 8900, avgWeight: 220 },
    { category: 'Clothing', products: 85, fees: 7050, avgWeight: 65 }
  ],
  quarterlyComparison: [
    { quarter: 'Q1 2024', fees: 58700, weight: 135000, products: 1156, compliance: 89 },
    { quarter: 'Q2 2024', fees: 65900, weight: 142000, products: 1203, compliance: 92 },
    { quarter: 'Q3 2024', fees: 72400, weight: 148000, products: 1231, compliance: 88 },
    { quarter: 'Q4 2024', fees: 78450, weight: 145600, products: 1247, compliance: 94 }
  ],
  sustainabilityMetrics: {
    recyclablePercentage: 73.2,
    wasteReduction: 18.5,
    carbonFootprint: 2.8,
    circularityScore: 67
  }
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const response = await fetch('/api/analytics/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      overview: {
        totalFees: 0,
        totalProducts: 0,
        totalWeight: 0,
        recyclabilityRate: 0,
        quarterlyGrowth: 0,
        costSavings: 0
      },
      feesTrend: [],
      materialBreakdown: [],
      productCategories: [],
      quarterlyComparison: [],
      sustainabilityMetrics: {
        recyclablePercentage: 0,
        wasteReduction: 0,
        carbonFootprint: 0,
        circularityScore: 0
      }
    };
  }
}

export async function calculateFeeProjections(months: number): Promise<Array<{ month: string; projected: number }> | null> {
  try {
    const response = await fetch(`/api/analytics/fee-projections?months=${months}`);
    if (!response.ok) {
      throw new Error('Failed to fetch fee projections');
    }
    const data = await response.json();
    
    if (data.status === 'insufficient_data' || data.projections === null) {
      return null;
    }
    
    return data.projections;
  } catch (error) {
    console.error('Error fetching fee projections:', error);
    return null;
  }
}

export async function getSustainabilityScore(): Promise<{value: number | null, status: string, message?: string}> {
  try {
    const response = await fetch('/api/analytics/sustainability-score');
    if (!response.ok) {
      throw new Error('Failed to fetch sustainability score');
    }
    const data = await response.json();
    return {
      value: data.score,
      status: "success"
    };
  } catch (error) {
    console.error('Error fetching sustainability score:', error);
    return {
      value: null,
      status: "insufficient_data",
      message: "No data available. Start adding products to see your sustainability score."
    };
  }
}

export async function getOptimizationPotential(): Promise<{value: number | null, status: string, message?: string}> {
  try {
    const response = await fetch('/api/analytics/optimization-potential');
    if (!response.ok) {
      throw new Error('Failed to fetch optimization potential');
    }
    const data = await response.json();
    
    if (data.status === 'insufficient_data') {
      return {
        value: null,
        status: "insufficient_data",
        message: "More data required. This metric will populate after 3 months of data is available."
      };
    }
    
    return {
      value: data.potential,
      status: "success"
    };
  } catch (error) {
    console.error('Error fetching optimization potential:', error);
    return {
      value: null,
      status: "insufficient_data",
      message: "More data required. This metric will populate after 3 months of data is available."
    };
  }
}
