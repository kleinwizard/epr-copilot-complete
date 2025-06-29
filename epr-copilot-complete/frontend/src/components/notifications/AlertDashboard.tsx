
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bell, Calendar, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { getUpcomingEvents } from '@/services/calendarService';
import { getNotificationStats } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export function AlertDashboard() {
  const [alertsCount, setAlertsCount] = useState({
    critical: 2,
    high: 5,
    medium: 8,
    total: 15
  });
  
  const [complianceScore, setComplianceScore] = useState(94);
  const { toast } = useToast();

  const upcomingEvents = getUpcomingEvents(7); // Next 7 days
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{alertsCount.critical}</p>
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
                <p className="text-2xl font-bold text-orange-600">{alertsCount.high}</p>
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
                <p className="text-2xl font-bold text-blue-600">{criticalDeadlines.length}</p>
                <p className="text-sm text-muted-foreground">Critical Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(complianceScore)}`}>
                  {complianceScore}%
                </p>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
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
            Current compliance score and trending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance</span>
              <Badge className={getScoreBg(complianceScore)}>
                {complianceScore >= 95 ? 'Excellent' : complianceScore >= 90 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={complianceScore} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Data Quality</p>
                <p className="text-muted-foreground">98%</p>
              </div>
              <div>
                <p className="font-medium">Timely Submissions</p>
                <p className="text-muted-foreground">92%</p>
              </div>
              <div>
                <p className="font-medium">Fee Compliance</p>
                <p className="text-muted-foreground">96%</p>
              </div>
            </div>
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
            {criticalDeadlines.length === 0 ? (
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
                        Due: {deadline.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {Math.ceil((deadline.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
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
