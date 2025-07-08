
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bell, Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { getUpcomingEvents } from '@/services/calendarService';
import { getNotificationStats } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';
import { complianceCalculationService, ComplianceCalculation } from '@/services/complianceCalculationService';

export function AlertDashboard() {
  const [alertsCount, setAlertsCount] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    total: 0
  });
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  
  const [complianceCalculation, setComplianceCalculation] = useState<ComplianceCalculation | null>(null);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadComplianceScore();
    loadAlertCounts();
    loadUpcomingEvents();
  }, []);

  const loadAlertCounts = async () => {
    try {
      setIsLoadingAlerts(true);
      const alertStats = await getNotificationStats();
      setAlertsCount({
        critical: alertStats.byType?.deadline || 0,
        high: alertStats.highPriority || 0,
        medium: alertStats.unread - alertStats.highPriority || 0,
        total: alertStats.total || 0
      });
    } catch (error) {
      console.error('Failed to load alert counts:', error);
      toast({
        title: "Error",
        description: "Failed to load alert statistics.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const loadComplianceScore = async () => {
    try {
      setIsLoadingCompliance(true);
      const calculation = await complianceCalculationService.calculateComplianceScore();
      setComplianceCalculation(calculation);
    } catch (error) {
      console.error('Failed to load compliance score:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance score.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCompliance(false);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const events = await getUpcomingEvents(7); // Next 7 days
      setUpcomingEvents(Array.isArray(events) ? events : []);
    } catch (error) {
      console.error('Failed to load upcoming events:', error);
      setUpcomingEvents([]);
      toast({
        title: "Error",
        description: "Failed to load upcoming events.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const criticalDeadlines = upcomingEvents.filter(event => 
    event.priority === 'critical' && 
    new Date(event.date).getTime() - new Date().getTime() <= 7 * 24 * 60 * 60 * 1000
  );

  const handleTestAlert = () => {
    toast({
      title: "Test Alert Triggered",
      description: "This is a sample compliance alert notification.",
      variant: "default",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 95) return 'bg-green-100';
    if (score >= 90) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const complianceScore = complianceCalculation?.overallScore || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alert Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of compliance alerts and deadlines
          </p>
        </div>
        
        <Button variant="outline" onClick={handleTestAlert}>
          <Bell className="h-4 w-4 mr-2" />
          Test Alert
        </Button>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                {isLoadingAlerts ? (
                  <p className="text-2xl font-bold text-gray-400">--</p>
                ) : (
                  <p className="text-2xl font-bold text-red-600">{alertsCount.critical}</p>
                )}
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                {isLoadingAlerts ? (
                  <p className="text-2xl font-bold text-gray-400">--</p>
                ) : (
                  <p className="text-2xl font-bold text-orange-600">{alertsCount.high}</p>
                )}
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                {isLoadingEvents ? (
                  <p className="text-2xl font-bold text-gray-400">--</p>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">{criticalDeadlines.length}</p>
                )}
                <p className="text-sm text-muted-foreground">Critical Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>
            Current compliance score and breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance</span>
              {isLoadingCompliance ? (
                <Badge variant="outline">Loading...</Badge>
              ) : (
                <Badge className={getScoreBg(complianceScore)}>
                  {complianceScore >= 95 ? 'Excellent' : complianceScore >= 90 ? 'Good' : 'Needs Attention'}
                </Badge>
              )}
            </div>
            <Progress value={complianceScore} className="h-2" />
            {complianceCalculation && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Company Profile</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.companyProfile.complete ? 
                      `${complianceCalculation.breakdown.companyProfile.weight}%` : '0%'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Materials Catalogued</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.materials.count > 0 ? 
                      `${complianceCalculation.breakdown.materials.weight}%` : '0%'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Products Catalogued</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.products.count > 0 ? 
                      `${complianceCalculation.breakdown.products.weight}%` : '0%'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Sales Data</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.salesData.complete ? 
                      `${complianceCalculation.breakdown.salesData.weight}%` : '0%'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Reports Generated</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.reports.count > 0 ? 
                      `${complianceCalculation.breakdown.reports.weight}%` : '0%'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Fees/PRO Membership</p>
                  <p className="text-muted-foreground">
                    {complianceCalculation.breakdown.fees.active ? 
                      `${complianceCalculation.breakdown.fees.weight}%` : '0%'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Critical Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Deadlines (Next 7 Days)</CardTitle>
          <CardDescription>
            Upcoming deadlines requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingEvents ? (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                <p className="text-muted-foreground">Loading critical deadlines...</p>
              </div>
            ) : criticalDeadlines.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-muted-foreground">No critical deadlines in the next 7 days</p>
              </div>
            ) : (
              criticalDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">{deadline.title}</p>
                      <p className="text-sm text-red-700">
                        Due: {deadline.date && deadline.date.toLocaleDateString ? deadline.date.toLocaleDateString() : 'Invalid date'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {deadline.date && deadline.date.getTime ? 
                      Math.ceil((deadline.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Alerts</CardTitle>
          <CardDescription>
            Latest automated compliance and system alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium">Fee calculation variance detected</p>
                  <p className="text-sm text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                Medium
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">New team member access granted</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Info
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Data backup completed successfully</p>
                  <p className="text-sm text-muted-foreground">6 hours ago</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Success
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
