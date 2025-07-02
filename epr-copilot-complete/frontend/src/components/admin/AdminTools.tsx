
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemAdministration } from './SystemAdministration';
import { FormBuilder } from './FormBuilder';
import { ReportDesigner } from './ReportDesigner';
import { WorkflowDesigner } from './WorkflowDesigner';
import { ProjectExport } from './ProjectExport';
import { apiService } from '@/services/apiService';

export const AdminTools = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    customForms: 0,
    customReports: 0,
    activeWorkflows: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const stats = await apiService.get('/admin/dashboard-stats');
        setAdminStats(stats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin & Customization Tools</h1>
          <p className="text-gray-600 mt-2">Manage system settings, create custom forms, reports, and workflows</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : adminStats.totalUsers}
            </div>
            <p className="text-xs text-gray-500">active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Forms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : adminStats.customForms}
            </div>
            <p className="text-xs text-gray-500">forms created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {loading ? '...' : adminStats.customReports}
            </div>
            <p className="text-xs text-gray-500">reports designed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loading ? '...' : adminStats.activeWorkflows}
            </div>
            <p className="text-xs text-gray-500">workflows running</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">System Admin</TabsTrigger>
          <TabsTrigger value="forms">Form Builder</TabsTrigger>
          <TabsTrigger value="reports">Report Designer</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Designer</TabsTrigger>
          <TabsTrigger value="export">Project Export</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="mt-6">
          <SystemAdministration />
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <FormBuilder />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportDesigner />
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowDesigner />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <ProjectExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
