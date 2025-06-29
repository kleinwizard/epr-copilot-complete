
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FeesTrendChart } from './FeesTrendChart';
import { MaterialBreakdownChart } from './MaterialBreakdownChart';
import { ProductCategoryAnalysis } from './ProductCategoryAnalysis';
import { AnalyticsData } from '@/services/analyticsService';

const chartConfig = {
  fees: { label: "Fees", color: "#3b82f6" },
  weight: { label: "Weight", color: "#10b981" }
};

interface OverviewTabProps {
  analyticsData: AnalyticsData;
}

export function OverviewTab({ analyticsData }: OverviewTabProps) {
  return (
    <div className="space-y-6">
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
