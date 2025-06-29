
import { MetricsCards } from './overview/MetricsCards';
import { ChartsSection } from './overview/ChartsSection';
import { ActionItems } from './overview/ActionItems';
import { RecentActivity } from './overview/RecentActivity';
import { ComplianceScoreWidget } from './ComplianceScoreWidget';
import { FinancialOverview } from './FinancialOverview';
import { QuickActionsPanel } from './QuickActionsPanel';
import { InteractiveCalendar } from './InteractiveCalendar';

export function DashboardOverview() {
  const complianceScore = 94;
  const daysToDeadline = 45;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <MetricsCards complianceScore={complianceScore} daysToDeadline={daysToDeadline} />

      {/* Enhanced Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ComplianceScoreWidget />
        <FinancialOverview />
      </div>

      {/* Interactive Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveCalendar />
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
