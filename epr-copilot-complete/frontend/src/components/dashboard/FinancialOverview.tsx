
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calculator, Calendar, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

const chartConfig = {
  actual: { label: "Actual", color: "#3b82f6" },
  budget: { label: "Budget", color: "#e5e7eb" },
  projected: { label: "Projected", color: "#f59e0b" }
};

interface FinancialData {
  currentQuarter: {
    fees: number;
    budget: number;
    variance: number;
  };
  ytd: {
    total: number;
    lastYear: number;
    growth: number;
  };
  projections: Array<{
    quarter: string;
    projected: number;
    actual?: number;
    budget: number;
  }>;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

const getZeroStateFinancialData = (): FinancialData => ({
  currentQuarter: {
    fees: 0,
    budget: 0,
    variance: 0
  },
  ytd: {
    total: 0,
    lastYear: 0,
    growth: 0
  },
  projections: [],
  breakdown: []
});

export function FinancialOverview() {
  const [data, setData] = useState<FinancialData>(getZeroStateFinancialData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const analyticsData = await dataService.getAnalytics();
      const products = await dataService.getProducts();
      const materials = await dataService.getMaterials();
      
      if (products.length === 0 && materials.length === 0) {
        setData(getZeroStateFinancialData());
      } else {
        setData({
          currentQuarter: {
            fees: analyticsData.totalFees || 0,
            budget: 0,
            variance: 0
          },
          ytd: {
            total: analyticsData.totalFees || 0,
            lastYear: 0,
            growth: 0
          },
          projections: [],
          breakdown: []
        });
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
      setData(getZeroStateFinancialData());
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    return variance > 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Financial Overview</span>
            </CardTitle>
            <CardDescription>EPR fees and budget tracking</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Calculator className="h-4 w-4 mr-2" />
              Fee Calculator
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Quarter</p>
                <p className="text-2xl font-bold">{formatCurrency(data.currentQuarter.fees)}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant={data.currentQuarter.variance > 0 ? "destructive" : "outline"} className="text-xs">
                    {data.currentQuarter.variance > 0 ? '+' : ''}{data.currentQuarter.variance}% vs budget
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Year to Date</p>
                <p className="text-2xl font-bold">{formatCurrency(data.ytd.total)}</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">+{data.ytd.growth}% YoY</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Budget Variance</p>
                <p className={`text-2xl font-bold ${getVarianceColor(data.currentQuarter.variance)}`}>
                  {data.currentQuarter.variance > 0 ? '+' : ''}{formatCurrency(data.currentQuarter.fees - data.currentQuarter.budget)}
                </p>
                <p className="text-xs text-muted-foreground">vs {formatCurrency(data.currentQuarter.budget)} budget</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Payment
              </Button>
              <Button variant="outline" size="sm">View Invoice History</Button>
              <Button variant="outline" size="sm">Download Receipt</Button>
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <div className="relative">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.projections}>
                    <XAxis dataKey="quarter" />
                    <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="budget" fill="var(--color-budget)" name="Budget" />
                    <Bar dataKey="actual" fill="var(--color-actual)" name="Actual" />
                    <Bar dataKey="projected" fill="var(--color-projected)" name="Projected" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              {data.projections.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="text-center">
                    <p className="text-muted-foreground">No projection data available</p>
                    <p className="text-sm text-muted-foreground">Add products to see financial projections</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">2025 Projections</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Q1 2025: {formatCurrency(85000)} (+24% vs Q1 2024)</li>
                  <li>• Annual projection: {formatCurrency(340000)}</li>
                  <li>• Based on current growth trends</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Optimization Opportunities</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Recyclability improvements: -$8,500</li>
                  <li>• Material substitutions: -$12,000</li>
                  <li>• Volume optimizations: -$6,200</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            {data.breakdown.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No fee breakdown available</p>
                <p className="text-sm text-muted-foreground">Add materials to see fee breakdown by category</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-muted-foreground">{item.percentage}% of total fees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
