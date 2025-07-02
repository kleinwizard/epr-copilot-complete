
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, Clock, Target } from 'lucide-react';

const chartConfig = {
  compliant: { label: "Compliant", color: "#10b981" },
  pending: { label: "Pending", color: "#f59e0b" },
  overdue: { label: "Overdue", color: "#ef4444" }
};

const complianceData = [
  { name: 'Compliant', value: 89, color: '#10b981' },
  { name: 'Pending', value: 8, color: '#f59e0b' },
  { name: 'Overdue', value: 3, color: '#ef4444' }
];

const metrics = [
  {
    title: 'Compliance Score',
    value: '94%',
    change: '+2.1%',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'On-Time Submissions',
    value: '12/13',
    change: '92.3%',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'Risk Level',
    value: 'Low',
    change: 'Stable',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Action Items',
    value: '3',
    change: '-2 this week',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export function ComplianceMetrics() {
  const [complianceData, setComplianceData] = useState<Array<{
    jurisdiction: string;
    score?: number;
    status: string;
    issues: number;
    trend: string;
  }>>([]);

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setComplianceData([]);
      } catch (error) {
        console.error('Failed to fetch compliance data:', error);
        setComplianceData([]);
      }
    };

    fetchComplianceData();
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {metric.change}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Distribution</CardTitle>
            <CardDescription>Current status of all compliance requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {complianceData.length > 0 ? complianceData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold">{item.value}%</span>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No compliance data available</p>
                  <p className="text-sm">Add products and calculate fees to see compliance metrics</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quarterly Progress</CardTitle>
            <CardDescription>Progress towards Q4 2024 compliance goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Product Registration</span>
                  <span>89/95 (94%)</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Material Documentation</span>
                  <span>156/160 (98%)</span>
                </div>
                <Progress value={98} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fee Calculations</span>
                  <span>1247/1250 (99%)</span>
                </div>
                <Progress value={99} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Report Submissions</span>
                  <span>12/13 (92%)</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
