
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calculator, Calendar, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const mockFinancialData: FinancialData = {
  currentQuarter: {
    fees: 78450,
    budget: 75000,
    variance: 4.6
  },
  ytd: {
    total: 289650,
    lastYear: 267800,
    growth: 8.2
  },
  projections: [
    { quarter: 'Q1 2024', projected: 65000, actual: 68200, budget: 70000 },
    { quarter: 'Q2 2024', projected: 72000, actual: 75400, budget: 73000 },
    { quarter: 'Q3 2024', projected: 78000, actual: 67600, budget: 75000 },
    { quarter: 'Q4 2024', projected: 82000, actual: 78450, budget: 80000 },
    { quarter: 'Q1 2025', projected: 85000, budget: 82000 },
    { quarter: 'Q2 2025', projected: 88000, budget: 85000 }
  ],
  breakdown: [
    { category: 'Plastic Materials', amount: 34225, percentage: 43.6 },
    { category: 'Glass Materials', amount: 18950, percentage: 24.2 },
    { category: 'Paper Materials', amount: 12675, percentage: 16.2 },
    { category: 'Metal Materials', amount: 8850, percentage: 11.3 },
    { category: 'Other Materials', amount: 3750, percentage: 4.8 }
  ]
};

export function FinancialOverview() {
  const data = mockFinancialData;

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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
