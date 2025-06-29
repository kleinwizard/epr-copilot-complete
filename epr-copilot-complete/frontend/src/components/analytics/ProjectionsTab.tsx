
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { calculateFeeProjections } from '@/services/analyticsService';

const chartConfig = {
  projected: { label: "Projected", color: "#ef4444" }
};

export function ProjectionsTab() {
  const projections = calculateFeeProjections(6);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Fee Projections & Forecasting</span>
          </CardTitle>
          <CardDescription>6-month fee projections based on current trends and planned changes</CardDescription>
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
            <h4 className="font-medium text-blue-900 mb-2">Key Insights & Recommendations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Projected 8% quarterly growth based on current trends</li>
              <li>• Estimated annual fees: $312,000 (+$47,000 vs current year)</li>
              <li>• Recyclability improvements could save an additional $12,000</li>
              <li>• Early compliance submissions offer 3% discount opportunities</li>
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
              <li>• Optimize packaging weights (-8%)</li>
              <li>• Switch to lower EPR rate materials</li>
              <li>• Implement automated compliance tracking</li>
            </ul>
            <Button size="sm" className="mt-3 w-full">
              View Optimization Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">Low Risk</div>
            <p className="text-sm text-muted-foreground mb-4">Current risk level</p>
            <ul className="text-sm space-y-2">
              <li>• 94% compliance score</li>
              <li>• All deadlines met this year</li>
              <li>• Strong recyclability rate (82%)</li>
              <li>• Proactive monitoring in place</li>
            </ul>
            <Button size="sm" variant="outline" className="mt-3 w-full">
              Risk Analysis Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">+8.5%</div>
            <p className="text-sm text-muted-foreground mb-4">Quarterly growth rate</p>
            <ul className="text-sm space-y-2">
              <li>• Product portfolio expansion</li>
              <li>• New market entries planned</li>
              <li>• Sustainable packaging adoption</li>
              <li>• Digital transformation benefits</li>
            </ul>
            <Button size="sm" variant="outline" className="mt-3 w-full">
              Growth Strategy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
