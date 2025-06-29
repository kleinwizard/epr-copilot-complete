
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadialBarChart, RadialBar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const chartConfig = {
  score: { label: "Score", color: "#10b981" },
  target: { label: "Target", color: "#3b82f6" },
  carbonSaved: { label: "Carbon Saved", color: "#10b981" },
  wasteReduced: { label: "Waste Reduced", color: "#f59e0b" }
};

const sustainabilityData = [
  { name: 'Current Score', score: 67, target: 75, fill: '#10b981' },
  { name: 'Industry Avg', score: 52, target: 75, fill: '#94a3b8' }
];

const impactTrend = [
  { month: 'Jan', carbonSaved: 1.2, wasteReduced: 15.3 },
  { month: 'Feb', carbonSaved: 1.8, wasteReduced: 18.1 },
  { month: 'Mar', carbonSaved: 2.1, wasteReduced: 22.4 },
  { month: 'Apr', carbonSaved: 2.8, wasteReduced: 19.8 },
  { month: 'May', carbonSaved: 3.2, wasteReduced: 25.6 },
  { month: 'Jun', carbonSaved: 3.8, wasteReduced: 28.9 }
];

export function SustainabilityCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sustainability Score Progress</CardTitle>
          <CardDescription>Current performance vs industry standards</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={sustainabilityData}>
              <RadialBar dataKey="score" cornerRadius={10} fill="var(--color-score)" />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadialBarChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">67/100</div>
              <p className="text-sm text-muted-foreground">Current Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">75/100</div>
              <p className="text-sm text-muted-foreground">Target Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact Trend</CardTitle>
          <CardDescription>Monthly carbon and waste reduction metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <AreaChart data={impactTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="carbonSaved" stackId="1" stroke="var(--color-carbonSaved)" fill="var(--color-carbonSaved)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="wasteReduced" stackId="1" stroke="var(--color-wasteReduced)" fill="var(--color-wasteReduced)" fillOpacity={0.6} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
