
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
            <span className="truncate">Advanced Analytics &amp; Insights</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Comprehensive insights into EPR compliance, sustainability impact, and cost optimization opportunities
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={`text-xs lg:text-sm ${
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
              className={`text-xs lg:text-sm ${
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
        
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-28 lg:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hidden sm:flex">
            <Calendar className="h-3 w-3 mr-1" />
            Q4 2024
          </Badge>
          
          
          <Button variant="outline" size="sm" onClick={() => {
            console.log('Refresh Data clicked');
            window.location.reload();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Refresh Data</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          
          <Button size="sm" onClick={async () => {
            try {
              const exportData = {
                period: selectedPeriod,
                timestamp: new Date().toISOString(),
                analytics: analyticsData,
                sustainabilityScore: sustainabilityScore.value,
                optimizationPotential: optimizationPotential.value
              };
              
              const dataStr = JSON.stringify(exportData, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              
              const link = document.createElement('a');
              link.href = url;
              link.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Failed to export report:', error);
              alert('Failed to export report. Please try again.');
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
          
          <Button variant="outline" size="sm" className="hidden sm:flex" onClick={async () => {
            try {
              const shareableData = {
                period: selectedPeriod,
                timestamp: new Date().toISOString(),
                sustainabilityScore: sustainabilityScore.value,
                optimizationPotential: optimizationPotential.value,
                summary: {
                  totalFees: analyticsData?.overview?.totalFees || 0,
                  totalProducts: analyticsData?.overview?.totalProducts || 0,
                  recyclabilityRate: analyticsData?.overview?.recyclabilityRate || 0
                }
              };
              
              const shareUrl = `${window.location.origin}/analytics/shared?data=${encodeURIComponent(btoa(JSON.stringify(shareableData)))}`;
              
              if (navigator.share) {
                await navigator.share({
                  title: 'EPR Analytics Dashboard',
                  text: 'View my EPR compliance analytics dashboard',
                  url: shareUrl
                });
              } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Shareable link copied to clipboard!');
              }
            } catch (error) {
              console.error('Failed to share dashboard:', error);
              alert('Failed to share dashboard. Please try again.');
            }
          }}>
            <Share className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Share Dashboard</span>
            <span className="lg:hidden">Share</span>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          {/* <TabsTrigger value="sustainability">Sustainability</TabsTrigger> */}
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
