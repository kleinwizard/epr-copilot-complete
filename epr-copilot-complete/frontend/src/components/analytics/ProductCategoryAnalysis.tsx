
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AnalyticsData } from '@/services/analyticsService';

interface ProductCategoryAnalysisProps {
  data: AnalyticsData['productCategories'];
}

const chartConfig = {
  products: {
    label: "Products",
    color: "#3b82f6",
  },
  fees: {
    label: "Fees",
    color: "#10b981",
  },
  avgWeight: {
    label: "Avg Weight",
    color: "#f59e0b",
  },
};

export function ProductCategoryAnalysis({ data }: ProductCategoryAnalysisProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Categories Performance</CardTitle>
          <CardDescription>Products count and fees by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="products" fill="var(--color-products)" name="Products" />
              <Bar yAxisId="right" dataKey="fees" fill="var(--color-fees)" name="Fees ($)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Detailed breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Total Fees</TableHead>
                <TableHead className="text-right">Avg Weight (g)</TableHead>
                <TableHead className="text-right">Fee per Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((category) => (
                <TableRow key={category.category}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell className="text-right">{category.products}</TableCell>
                  <TableCell className="text-right">${category.fees.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{category.avgWeight}g</TableCell>
                  <TableCell className="text-right">
                    ${(category.fees / category.products).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
