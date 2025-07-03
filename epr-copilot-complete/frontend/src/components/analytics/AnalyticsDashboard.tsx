
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsOverview } from './AnalyticsOverview';
import { OverviewTab } from './OverviewTab';
import { CostAnalysis } from './CostAnalysis';
import { MaterialBreakdownChart } from './MaterialBreakdownChart';
import { SustainabilityInsights } from './SustainabilityInsights';
import { ProjectionsTab } from './ProjectionsTab';
import { getAnalyticsData, getSustainabilityScore, getOptimizationPotential } from '@/services/analyticsService';
import { Download, RefreshCw, Calendar, Filter, Share, BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [sustainabilityScore, setSustainabilityScore] = useState<{value: number | null, status: string, message?: string}>({value: 0, status: 'loading'});
  const [optimizationPotential, setOptimizationPotential] = useState<{value: number | null, status: string, message?: string}>({value: 0, status: 'loading'});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        const [analyticsData, sustainabilityScore, optimizationPotential] = await Promise.all([
          getAnalyticsData(),
          getSustainabilityScore(),
          getOptimizationPotential()
        ]);
        
        setAnalyticsData(analyticsData);
        setSustainabilityScore(sustainabilityScore);
        setOptimizationPotential(optimizationPotential);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
        setSustainabilityScore({value: 0, status: 'error'});
        setOptimizationPotential({value: 0, status: 'error'});
        setAnalyticsData(await getAnalyticsData());
      }finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with more analytics context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span>Advanced Analytics &amp; Insights</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into EPR compliance, sustainability impact, and cost optimization opportunities
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge 
              variant="outline" 
              className={`${
                sustainabilityScore.status === 'insufficient_data' 
                  ? 'bg-gray-50 text-gray-500 border-gray-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {isLoading ? 'Loading...' : 
                sustainabilityScore.status === 'insufficient_data' 
                  ? 'Sustainability Score - Insufficient Data'
                  : `${sustainabilityScore.value}/100 Sustainability Score`
              }
            </Badge>
            <Badge 
              variant="outline" 
              className={`${
                optimizationPotential.status === 'insufficient_data' 
                  ? 'bg-gray-50 text-gray-500 border-gray-200' 
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}
            >
              {isLoading ? 'Loading...' : 
                optimizationPotential.status === 'insufficient_data' 
                  ? 'Optimization Potential - Insufficient Data'
                  : `$${Math.round((optimizationPotential.value || 0) / 1000)}k Optimization Potential`
              }
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Q4 2024
          </Badge>
          
          <Button variant="outline" size="sm" onClick={() => {
            console.log('Advanced Filters clicked');
            alert('Advanced Filters panel will be implemented');
          }}>
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => {
            console.log('Refresh Data clicked');
            window.location.reload();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button size="sm" onClick={() => window.location.href = '/reports/export'}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share Dashboard
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading analytics data...</div>
        </div>
      ) : analyticsData ? (
        <AnalyticsOverview data={analyticsData} />
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">No analytics data available</div>
        </div>
      )}

      {/* Enhanced Analytics Tabs with new sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {analyticsData && <OverviewTab analyticsData={analyticsData} />}
        </TabsContent>


        <TabsContent value="costs">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="materials">
          {analyticsData?.materialBreakdown && <MaterialBreakdownChart data={analyticsData.materialBreakdown} />}
        </TabsContent>

        <TabsContent value="sustainability">
          <SustainabilityInsights />
        </TabsContent>

        <TabsContent value="projections">
          <ProjectionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
