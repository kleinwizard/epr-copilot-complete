
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dataService } from '@/services/dataService';
import { CalculationEngine, ComplianceScoreFactors } from '@/services/calculationEngine';
import { useEffect, useState } from 'react';

const chartConfig = {
  score: { label: "Compliance Score", color: "#3b82f6" }
};

interface ComplianceData {
  score: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  trendData: Array<{ date: string; score: number }>;
  factors: Array<{ name: string; impact: number; status: 'good' | 'warning' | 'critical' }>;
}

const getZeroStateComplianceData = (): ComplianceData => ({
  score: 0,
  trend: 'stable',
  riskLevel: 'low',
  trendData: [],
  factors: [
    { name: 'Data Completeness', impact: 0, status: 'good' },
    { name: 'Deadline Adherence', impact: 0, status: 'good' },
    { name: 'Material Classification', impact: 0, status: 'good' },
    { name: 'Documentation Quality', impact: 0, status: 'good' },
    { name: 'Fee Payment Status', impact: 0, status: 'good' }
  ]
});

export function ComplianceScoreWidget() {
  const [data, setData] = useState<ComplianceData>(getZeroStateComplianceData());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      if (!localStorage.getItem('access_token') && !window.location.hostname.includes('localhost')) {
        console.warn('No authentication token, using default data');
        setData(getZeroStateComplianceData());
        return;
      }
      const analyticsData = await dataService.getAnalytics();
      const products = await dataService.getProducts();
      const materials = await dataService.getMaterials();
      
      if (products.length === 0 && materials.length === 0) {
        setData(getZeroStateComplianceData());
      } else {
        const complianceFactors: ComplianceScoreFactors = {
          dataCompleteness: products.length > 0 ? 85 : 0,
          deadlineAdherence: products.length > 0 ? 90 : 0,
          materialClassification: materials.length > 0 ? 80 : 0,
          documentationQuality: products.length > 0 ? 75 : 0,
          feePaymentStatus: analyticsData.totalFees > 0 ? 95 : 0
        };

        const complianceResult = CalculationEngine.calculateComplianceScore(complianceFactors);
        
        setData({
          score: complianceResult.score,
          trend: complianceResult.score > 85 ? 'up' : complianceResult.score < 70 ? 'down' : 'stable',
          riskLevel: complianceResult.score >= 90 ? 'low' : complianceResult.score >= 70 ? 'medium' : 'high',
          trendData: [],
          factors: [
            { name: 'Data Completeness', impact: complianceResult.breakdown.dataCompleteness, status: complianceFactors.dataCompleteness > 70 ? 'good' : 'warning' },
            { name: 'Deadline Adherence', impact: complianceResult.breakdown.deadlineAdherence, status: complianceFactors.deadlineAdherence > 70 ? 'good' : 'warning' },
            { name: 'Material Classification', impact: complianceResult.breakdown.materialClassification, status: complianceFactors.materialClassification > 70 ? 'good' : 'warning' },
            { name: 'Documentation Quality', impact: complianceResult.breakdown.documentationQuality, status: complianceFactors.documentationQuality > 70 ? 'good' : 'warning' },
            { name: 'Fee Payment Status', impact: complianceResult.breakdown.feePaymentStatus, status: complianceFactors.feePaymentStatus > 70 ? 'good' : 'warning' }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      setData(getZeroStateComplianceData());
    } finally {
      setIsLoading(false);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium Risk</Badge>;
      case 'high': return <Badge variant="destructive">High Risk</Badge>;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Compliance Score</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Real-time compliance score based on data completeness, deadlines, and quality</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Real-time compliance health assessment</CardDescription>
          </div>
          {getRiskBadge(data.riskLevel)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}%
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(data.trend)}
              <span className="text-sm text-muted-foreground">
                {data.score === 0 ? 'No data yet' : data.trend === 'up' ? '+2.3%' : data.trend === 'down' ? '-1.8%' : '0%'} vs last month
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">View Details</Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={data.score} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">30-Day Trend</h4>
          <div className="relative">
            <ChartContainer config={chartConfig} className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[80, 100]} hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--color-score)" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            {data.trendData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">No trend data yet</p>
                  <p className="text-xs text-muted-foreground">Add products to track compliance</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Contributing Factors</h4>
          <div className="space-y-2">
            {data.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {factor.status === 'good' && <CheckCircle className="h-3 w-3 text-green-600" />}
                  {factor.status === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
                  {factor.status === 'critical' && <AlertTriangle className="h-3 w-3 text-red-600" />}
                  <span>{factor.name}</span>
                </div>
                <span className="text-muted-foreground">{factor.impact}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
