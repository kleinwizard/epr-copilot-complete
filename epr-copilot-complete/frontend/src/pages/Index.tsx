
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { CompanySetup } from '@/components/company/CompanySetup';
import { ProductCatalog } from '@/components/products/ProductCatalog';
import { MaterialLibrary } from '@/components/materials/MaterialLibrary';
import { BulkImport } from '@/components/bulk/BulkImport';
import { FeeManagement } from '@/components/fees/FeeManagement';
import { QuarterlyReports } from '@/components/reports/QuarterlyReports';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ComplianceCalendar } from '@/components/calendar/ComplianceCalendar';
import { TeamManagement } from '@/components/team/TeamManagement';
import { Settings } from '@/components/settings/Settings';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { AlertDashboard } from '@/components/notifications/AlertDashboard';
import { ERPIntegration } from '@/components/integrations/ERPIntegration';
import { IntegrationHub } from '@/components/integrations/IntegrationHub';
import { CommunicationHub } from '@/components/communication/CommunicationHub';
import { AdminTools } from '@/components/admin/AdminTools';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/components/auth/AuthProvider';
import { SupportHelpSystem } from '@/components/support/SupportHelpSystem';
import { MobileFramework } from '@/components/mobile/MobileFramework';
import { ProjectExport } from '@/components/admin/ProjectExport';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user } = useAuth();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      // This would be handled by the AuthProvider in a real app
      console.log('User found in localStorage');
    }
  }, [user]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'company':
        return <CompanySetup />;
      case 'product-catalog':
        return <ProductCatalog />;
      case 'materials':
        return <MaterialLibrary />;
      case 'bulk-import':
        return <BulkImport />;
      case 'fees':
        return <FeeManagement />;
      case 'quarterly-reports':
        return <QuarterlyReports />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'calendar':
        return <ComplianceCalendar />;
      case 'notifications':
        return <NotificationCenter />;
      case 'alert-dashboard':
        return <AlertDashboard />;
      case 'erp-integration':
        return <ERPIntegration />;
      case 'integration-hub':
        return <IntegrationHub />;
      case 'communication':
        return <CommunicationHub />;
      case 'mobile-pwa':
        return <MobileFramework />;
      case 'team':
        return <TeamManagement />;
      case 'admin-tools':
        return <AdminTools />;
      case 'auth':
        return <AuthPage />;
      case 'settings':
        return <Settings />;
      case 'support-help':
        return <SupportHelpSystem />;
      case 'project-export':
        return <ProjectExport />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header currentPage={currentPage} />
        <main className="flex-1 p-6 relative z-10">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
