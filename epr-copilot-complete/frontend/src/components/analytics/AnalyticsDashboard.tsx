
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsOverview } from './AnalyticsOverview';
import { OverviewTab } from './OverviewTab';
import { ComplianceMetrics } from './ComplianceMetrics';
import { CostAnalysis } from './CostAnalysis';
import { MaterialBreakdownChart } from './MaterialBreakdownChart';
import { SustainabilityInsights } from './SustainabilityInsights';
import { ProjectionsTab } from './ProjectionsTab';
import { getAnalyticsData } from '@/services/analyticsService';
import { Download, RefreshCw, Calendar, Filter, Share, BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [activeTab, setActiveTab] = useState('overview');
  const analyticsData = getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Enhanced Header with more analytics context */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span>Advanced Analytics & Insights</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into EPR compliance, sustainability impact, and cost optimization opportunities
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              94% Compliance Score
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              67/100 Sustainability Score
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              $29k Optimization Potential
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
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button size="sm">
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
      <AnalyticsOverview data={analyticsData} />

      {/* Enhanced Analytics Tabs with new sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab analyticsData={analyticsData} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceMetrics />
        </TabsContent>

        <TabsContent value="costs">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="materials">
          <MaterialBreakdownChart data={analyticsData.materialBreakdown} />
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
