
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Calculator, Target, Lightbulb } from 'lucide-react';

const chartConfig = {
  fees: { label: "Fees", color: "#ef4444" },
  savings: { label: "Savings", color: "#10b981" },
  projected: { label: "Projected", color: "#3b82f6" }
};

const costTrend = [
  { month: 'Jan', fees: 18500, savings: 4625, projected: 19200 },
  { month: 'Feb', fees: 19200, savings: 4800, projected: 19800 },
  { month: 'Mar', fees: 21000, savings: 5250, projected: 21500 },
  { month: 'Apr', fees: 19800, savings: 4950, projected: 20100 },
  { month: 'May', fees: 22100, savings: 5525, projected: 22800 },
  { month: 'Jun', fees: 23850, savings: 5963, projected: 24200 }
];

const costBreakdown = [
  { category: 'Plastic (Non-Recyclable)', value: 34250, percentage: 44, color: '#ef4444' },
  { category: 'Glass', value: 18900, percentage: 24, color: '#3b82f6' },
  { category: 'Metal', value: 12600, percentage: 16, color: '#10b981' },
  { category: 'Paper', value: 8450, percentage: 11, color: '#f59e0b' },
  { category: 'Composite', value: 4250, percentage: 5, color: '#8b5cf6' }
];

const optimizationOpportunities = [
  {
    title: 'Switch to Recyclable Plastics',
    currentCost: 34250,
    potentialSaving: 15680,
    effort: 'Medium',
    timeframe: '6 months',
    impact: 'High'
  },
  {
    title: 'Optimize Packaging Weight',
    currentCost: 78450,
    potentialSaving: 8920,
    effort: 'Low',
    timeframe: '3 months',
    impact: 'Medium'
  },
  {
    title: 'Alternative Material Sourcing',
    currentCost: 23100,
    potentialSaving: 4560,
    effort: 'High',
    timeframe: '12 months',
    impact: 'Medium'
  }
];

export function CostAnalysis() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Quarterly Fees</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">$78,450</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    +8.5%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">$29,160</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    37% reduction
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost per Unit</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">$0.063</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    vs $0.071 avg
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Projection</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">$327k</span>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    +$52k YoY
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Trend Analysis</CardTitle>
            <CardDescription>Monthly fees vs recyclability savings</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ComposedChart data={costTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="fees" fill="var(--color-fees)" name="EPR Fees ($)" />
                <Bar dataKey="savings" fill="var(--color-savings)" name="Recyclability Savings ($)" />
                <Line type="monotone" dataKey="projected" stroke="var(--color-projected)" strokeWidth={3} strokeDasharray="5 5" name="Projected ($)" />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Material</CardTitle>
            <CardDescription>Distribution of EPR fees across material types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.category}</span>
                  <span className="font-medium">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Cost Optimization Opportunities</span>
          </CardTitle>
          <CardDescription>Actionable recommendations to reduce EPR fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationOpportunities.map((opportunity, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{opportunity.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={opportunity.impact === 'High' ? 'default' : opportunity.impact === 'Medium' ? 'secondary' : 'outline'}>
                      {opportunity.impact} Impact
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {opportunity.effort} Effort
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Cost</p>
                    <p className="text-lg font-bold">${opportunity.currentCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Potential Saving</p>
                    <p className="text-lg font-bold text-green-600">${opportunity.potentialSaving.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeframe</p>
                    <p className="text-lg font-bold text-blue-600">{opportunity.timeframe}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ROI: {((opportunity.potentialSaving / opportunity.currentCost) * 100).toFixed(1)}% annually
                  </div>
                  <Button size="sm" variant="outline">
                    View Implementation Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Quick Wins</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Implement packaging weight optimization (3-month payback)</li>
              <li>• Negotiate volume discounts with current suppliers</li>
              <li>• Review and update material specifications quarterly</li>
              <li>• Consider bulk purchasing agreements for sustainable materials</li>
            </ul>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Cost Modeling Tool
            </Button>
            <Button size="sm">
              Start Optimization Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
