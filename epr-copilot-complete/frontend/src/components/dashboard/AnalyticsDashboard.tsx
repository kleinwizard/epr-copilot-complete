
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalyticsOverview } from '../analytics/AnalyticsOverview';
import { FeesTrendChart } from '../analytics/FeesTrendChart';
import { MaterialBreakdownChart } from '../analytics/MaterialBreakdownChart';
import { ProductCategoryAnalysis } from '../analytics/ProductCategoryAnalysis';
import { getAnalyticsData, calculateFeeProjections } from '@/services/analyticsService';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { Download, RefreshCw, Calendar, TrendingUp } from 'lucide-react';

const chartConfig = {
  fees: { label: "Fees", color: "#3b82f6" },
  weight: { label: "Weight", color: "#10b981" },
  products: { label: "Products", color: "#f59e0b" },
  compliance: { label: "Compliance", color: "#8b5cf6" },
  projected: { label: "Projected", color: "#ef4444" }
};

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const analyticsData = getAnalyticsData();
  const projections = calculateFeeProjections(6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your EPR compliance performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Q4 2024
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <AnalyticsOverview data={analyticsData} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Fee Trends</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <FeesTrendChart data={analyticsData.feesTrend} />
          
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Comparison</CardTitle>
              <CardDescription>Year-over-year compliance metrics</CardDescription>
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
                  <Line yAxisId="right" dataKey="compliance" stroke="var(--color-compliance)" strokeWidth={3} name="Compliance %" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <MaterialBreakdownChart data={analyticsData.materialBreakdown} />
        </TabsContent>

        <TabsContent value="categories">
          <ProductCategoryAnalysis data={analyticsData.productCategories} />
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Fee Projections</span>
              </CardTitle>
              <CardDescription>6-month fee projections based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="projected" 
                    stroke="var(--color-projected)" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    name="Projected Fees ($)"
                  />
                </LineChart>
              </ChartContainer>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Insights</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Projected 8% quarterly growth based on current trends</li>
                  <li>• Estimated annual fees: $312,000 (+$47,000 vs current year)</li>
                  <li>• Recyclability improvements could save an additional $12,000</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">-$15,680</div>
                <p className="text-sm text-muted-foreground mb-4">Potential annual savings</p>
                <ul className="text-sm space-y-2">
                  <li>• Increase recyclable materials by 5%</li>
                  <li>• Optimize packaging weights</li>
                  <li>• Switch to lower EPR rate materials</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compliance Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">Low</div>
                <p className="text-sm text-muted-foreground mb-4">Risk assessment</p>
                <ul className="text-sm space-y-2">
                  <li>• 94% compliance score</li>
                  <li>• All deadlines met this year</li>
                  <li>• Strong recyclability rate</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">+8.5%</div>
                <p className="text-sm text-muted-foreground mb-4">Quarterly growth rate</p>
                <ul className="text-sm space-y-2">
                  <li>• Product portfolio expansion</li>
                  <li>• New market entries</li>
                  <li>• Sustainable packaging adoption</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
