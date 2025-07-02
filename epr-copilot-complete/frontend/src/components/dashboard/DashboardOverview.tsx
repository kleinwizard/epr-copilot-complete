
import { MetricsCards } from './overview/MetricsCards';
import { ChartsSection } from './overview/ChartsSection';
import { ActionItems } from './overview/ActionItems';
import { RecentActivity } from './overview/RecentActivity';
import { ComplianceScoreWidget } from './ComplianceScoreWidget';
import { FinancialOverview } from './FinancialOverview';
import { QuickActionsPanel } from './QuickActionsPanel';
import { useComplianceDueDates } from '@/hooks/useComplianceDueDates';
import { dataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

export function DashboardOverview() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { dueDates } = useComplianceDueDates();
  
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await dataService.getAnalytics();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalyticsData({
        complianceScore: 0,
        daysToDeadline: 0,
        totalProducts: 0,
        totalFees: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const complianceScore = analyticsData?.complianceScore || 0;
  const daysToDeadline = analyticsData?.daysToDeadline || 0;
  const totalFees = analyticsData?.totalFees || 0;
  const totalProducts = analyticsData?.totalProducts || 0;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <MetricsCards 
        complianceScore={complianceScore} 
        daysToDeadline={daysToDeadline}
        totalFees={totalFees}
        totalProducts={totalProducts}
      />

      {/* Enhanced Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ComplianceScoreWidget />
        <FinancialOverview />
      </div>

      {/* Interactive Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsPanel />
      </div>

      {/* Charts Row */}
      <ChartsSection />

      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionItems />
        <RecentActivity />
      </div>
    </div>
  );
}
