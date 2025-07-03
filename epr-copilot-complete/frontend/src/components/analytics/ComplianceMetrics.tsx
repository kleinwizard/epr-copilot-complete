
import { useState, useEffect } from 'react';
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


export function ComplianceMetrics() {
  const [complianceData, setComplianceData] = useState([
    { name: 'Compliant', value: 0, color: '#10b981' },
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'Overdue', value: 0, color: '#ef4444' }
  ]);
  
  const [metrics, setMetrics] = useState([
    {
      title: 'Compliance Score',
      value: '0%',
      change: '0%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'On-Time Submissions',
      value: '0/0',
      change: '0%',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Risk Level',
      value: 'Unknown',
      change: 'Loading',
      icon: Target,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Action Items',
      value: '0',
      change: 'Loading',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]);
  
  const [quarterlyProgress, setQuarterlyProgress] = useState([
    { name: 'Product Registration', completed: 0, total: 0, percentage: 0 },
    { name: 'Material Documentation', completed: 0, total: 0, percentage: 0 },
    { name: 'Fee Calculations', completed: 0, total: 0, percentage: 0 },
    { name: 'Report Submissions', completed: 0, total: 0, percentage: 0 }
  ]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        setIsLoading(true);
        // const complianceStats = await complianceService.getComplianceDistribution();
        // const complianceMetrics = await complianceService.getMetrics();
        
        setComplianceData([
          { name: 'Compliant', value: 0, color: '#10b981' },
          { name: 'Pending', value: 0, color: '#f59e0b' },
          { name: 'Overdue', value: 0, color: '#ef4444' }
        ]);
        
        setMetrics([
          {
            title: 'Compliance Score',
            value: '0%',
            change: '0%',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            title: 'On-Time Submissions',
            value: '0/0',
            change: '0%',
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'Risk Level',
            value: 'Unknown',
            change: 'Loading',
            icon: Target,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
          },
          {
            title: 'Action Items',
            value: '0',
            change: 'Loading',
            icon: AlertTriangle,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          }
        ]);
        
        setQuarterlyProgress([
          { name: 'Product Registration', completed: 0, total: 0, percentage: 0 },
          { name: 'Material Documentation', completed: 0, total: 0, percentage: 0 },
          { name: 'Fee Calculations', completed: 0, total: 0, percentage: 0 },
          { name: 'Report Submissions', completed: 0, total: 0, percentage: 0 }
        ]);
      } catch (error) {
        console.error('Failed to load compliance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComplianceData();
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
              {complianceData.map((item, index) => (
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
              ))}
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading progress data...</p>
                </div>
              ) : (
                quarterlyProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span>{item.completed}/{item.total} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
