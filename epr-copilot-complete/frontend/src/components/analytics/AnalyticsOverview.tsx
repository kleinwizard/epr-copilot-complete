
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Scale,
  DollarSign,
  Recycle,
  Target,
  Leaf
} from 'lucide-react';
import type { AnalyticsData } from '@/services/analyticsService';

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const { overview, sustainabilityMetrics } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total EPR Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${overview.totalFees.toLocaleString()}</div>
          <div className="flex items-center space-x-2 mt-2">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+{overview.quarterlyGrowth}% this quarter</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Saved ${overview.costSavings.toLocaleString()} via recyclability
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <Package className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalProducts.toLocaleString()}</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              5 categories
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all product lines
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
          <Scale className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(overview.totalWeight / 1000).toFixed(1)}kg</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Q4 2024
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Packaging materials reported
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recyclability Rate</CardTitle>
          <Recycle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{overview.recyclabilityRate}%</div>
          <div className="mt-2">
            <Progress value={overview.recyclabilityRate} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Above industry average (65%)
          </p>
        </CardContent>
      </Card>

      {/* Sustainability Metrics Row */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span>Sustainability Metrics</span>
          </CardTitle>
          <CardDescription>Environmental impact indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Recyclable Materials</span>
                <span className="text-sm text-green-600">{sustainabilityMetrics.recyclablePercentage}%</span>
              </div>
              <Progress value={sustainabilityMetrics.recyclablePercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Circularity Score</span>
                <span className="text-sm text-blue-600">{sustainabilityMetrics.circularityScore}/100</span>
              </div>
              <Progress value={sustainabilityMetrics.circularityScore} className="h-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">{sustainabilityMetrics.wasteReduction}%</div>
              <div className="text-xs text-green-600">Waste Reduction</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">{sustainabilityMetrics.carbonFootprint}t</div>
              <div className="text-xs text-blue-600">Carbon Saved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Compliance Goals</span>
          </CardTitle>
          <CardDescription>Progress toward sustainability targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">2024 Recyclability Target (75%)</span>
              <span className="text-sm">{overview.recyclabilityRate}% / 75%</span>
            </div>
            <Progress value={(overview.recyclabilityRate / 75) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">2.8% to goal</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fee Optimization Target</span>
              <span className="text-sm">${overview.costSavings.toLocaleString()} saved</span>
            </div>
            <Progress value={78} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">$4,320 more to reach annual target</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
