
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import type { AnalyticsData } from '@/services/analyticsService';

interface FeesTrendChartProps {
  data: AnalyticsData['feesTrend'];
}

const chartConfig = {
  fees: {
    label: "Gross Fees",
    color: "#3b82f6",
  },
  recyclabilityDiscount: {
    label: "Recyclability Discount",
    color: "#10b981",
  },
  netFees: {
    label: "Net Fees",
    color: "#8b5cf6",
  },
};

export function FeesTrendChart({ data }: FeesTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>EPR Fees Trend</CardTitle>
        <CardDescription>Monthly fees with recyclability discounts applied</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="fees" fill="var(--color-fees)" name="Gross Fees" />
            <Bar dataKey="recyclabilityDiscount" fill="var(--color-recyclabilityDiscount)" name="Discount" />
            <Line type="monotone" dataKey="netFees" stroke="var(--color-netFees)" strokeWidth={3} name="Net Fees" />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
