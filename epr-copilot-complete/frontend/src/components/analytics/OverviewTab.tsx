
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FeesTrendChart } from './FeesTrendChart';
import { MaterialBreakdownChart } from './MaterialBreakdownChart';
import { ProductCategoryAnalysis } from './ProductCategoryAnalysis';
import { AnalyticsData } from '@/services/analyticsService';
import { DollarSign, Package, Weight, Recycle } from 'lucide-react';

const chartConfig = {
  fees: { label: "Fees", color: "#3b82f6" },
  weight: { label: "Weight", color: "#10b981" }
};

interface OverviewTabProps {
  analyticsData: AnalyticsData;
}

interface OverviewMetrics {
  totalEprFees: number;
  activeProducts: number;
  totalWeight: number;
  recyclabilityRate: number;
}

export function OverviewTab({ analyticsData }: OverviewTabProps) {
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics>({
    totalEprFees: 0,
    activeProducts: 0,
    totalWeight: 0,
    recyclabilityRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics/overview-metrics');
        if (response.ok) {
          const data = await response.json();
          setOverviewMetrics(data);
        } else {
          setOverviewMetrics({
            totalEprFees: 0,
            activeProducts: 0,
            totalWeight: 0,
            recyclabilityRate: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch overview metrics:', error);
        setOverviewMetrics({
          totalEprFees: 0,
          activeProducts: 0,
          totalWeight: 0,
          recyclabilityRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total EPR Fees</p>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : `$${overviewMetrics.totalEprFees.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">Cumulative fees paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : overviewMetrics.activeProducts.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Currently tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Weight className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Weight</p>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : `${overviewMetrics.totalWeight.toLocaleString()} kg`}
                </div>
                <p className="text-xs text-muted-foreground">All active products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Recycle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recyclability Rate</p>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : `${overviewMetrics.recyclabilityRate}%`}
                </div>
                <p className="text-xs text-muted-foreground">Material recyclability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeesTrendChart data={analyticsData.feesTrend} />
        <MaterialBreakdownChart data={analyticsData.materialBreakdown} />
      </div>
      
      <ProductCategoryAnalysis data={analyticsData.productCategories} />
      
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Comparison</CardTitle>
          <CardDescription>Year-over-year compliance and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={analyticsData.quarterlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="fees" fill="var(--color-fees)" name="Fees ($)" />
              <Bar yAxisId="left" dataKey="weight" fill="var(--color-weight)" name="Weight (kg)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
