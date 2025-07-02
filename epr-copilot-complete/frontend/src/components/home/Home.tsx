import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Package,
  FileText,
  Calendar
} from 'lucide-react';

interface HomeProps {
  onPageChange?: (page: string) => void;
}

interface ComplianceMetric {
  category: string;
  current: number;
  target: number;
  status: 'compliant' | 'warning' | 'overdue';
  lastUpdated: string;
}

interface FinancialSummary {
  period: string;
  fees: number;
  penalties: number;
  savings: number;
  total: number;
}

interface UpcomingDeadline {
  task: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export function Home({ onPageChange }: HomeProps) {
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      const hasOrganizationData = localStorage.getItem('epr_organization_initialized') === 'true';
      const hasProductData = localStorage.getItem('epr_products_count');
      const productCount = hasProductData ? parseInt(hasProductData) : 0;
      
      if (!hasOrganizationData || productCount === 0) {
        setComplianceMetrics([]);
        setFinancialSummary([]);
        setUpcomingDeadlines([]);
      } else {
        const storedMetrics = localStorage.getItem('epr_compliance_metrics');
        const storedFinancials = localStorage.getItem('epr_financial_summary');
        const storedDeadlines = localStorage.getItem('epr_upcoming_deadlines');
        
        setComplianceMetrics(storedMetrics ? JSON.parse(storedMetrics) : getDefaultMetrics());
        setFinancialSummary(storedFinancials ? JSON.parse(storedFinancials) : getDefaultFinancials());
        setUpcomingDeadlines(storedDeadlines ? JSON.parse(storedDeadlines) : getDefaultDeadlines());
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
      setComplianceMetrics([]);
      setFinancialSummary([]);
      setUpcomingDeadlines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultMetrics = (): ComplianceMetric[] => [
    { category: 'Packaging Compliance', current: 0, target: 100, status: 'warning', lastUpdated: 'Never' },
    { category: 'Material Reporting', current: 0, target: 100, status: 'warning', lastUpdated: 'Never' },
    { category: 'Fee Payments', current: 0, target: 100, status: 'overdue', lastUpdated: 'Never' },
    { category: 'Documentation', current: 0, target: 100, status: 'warning', lastUpdated: 'Never' }
  ];

  const getDefaultFinancials = (): FinancialSummary[] => [
    { period: 'Q1 2024', fees: 0, penalties: 0, savings: 0, total: 0 },
    { period: 'Q2 2024', fees: 0, penalties: 0, savings: 0, total: 0 },
    { period: 'Q3 2024', fees: 0, penalties: 0, savings: 0, total: 0 },
    { period: 'Q4 2024', fees: 0, penalties: 0, savings: 0, total: 0 }
  ];

  const getDefaultDeadlines = (): UpcomingDeadline[] => [
    { task: 'Complete company setup', dueDate: 'Pending', priority: 'high', status: 'pending' },
    { task: 'Add first product', dueDate: 'Pending', priority: 'high', status: 'pending' },
    { task: 'Configure materials', dueDate: 'Pending', priority: 'medium', status: 'pending' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      compliant: 'default',
      completed: 'default',
      warning: 'secondary',
      'in-progress': 'secondary',
      overdue: 'destructive',
      pending: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  const getPriorityBadge = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[priority] || 'secondary';
  };

  const handleQuickAction = (action: string) => {
    if (!onPageChange) return;
    
    switch (action) {
      case 'company-setup':
        onPageChange('company');
        break;
      case 'add-product':
        onPageChange('product-catalog');
        break;
      case 'fee-calculator':
        onPageChange('fees');
        break;
      case 'reports':
        onPageChange('quarterly-reports');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasData = complianceMetrics.length > 0 || financialSummary.length > 0 || upcomingDeadlines.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Home</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Welcome to EPR Compliance
            </CardTitle>
            <CardDescription>
              Get started by setting up your organization and adding your first products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuickAction('company-setup')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <Package className="h-6 w-6 mb-2" />
                Complete Company Setup
              </Button>
              <Button 
                onClick={() => handleQuickAction('add-product')}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center"
              >
                <FileText className="h-6 w-6 mb-2" />
                Add Your First Product
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Once you complete these steps, you'll see your compliance metrics and financial summaries here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Home</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleQuickAction('fee-calculator')} variant="outline" size="sm">
            <DollarSign className="h-4 w-4 mr-2" />
            Fee Calculator
          </Button>
          <Button onClick={() => handleQuickAction('reports')} size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Metrics
            </CardTitle>
            <CardDescription>Current compliance status across all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complianceMetrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{metric.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metric.current}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${metric.current}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(metric.status)}>
                        {getStatusIcon(metric.status)}
                        <span className="ml-1 capitalize">{metric.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {metric.lastUpdated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>Quarterly EPR fees and cost breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead>Penalties</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummary.map((summary, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{summary.period}</TableCell>
                    <TableCell>${summary.fees.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">
                      {summary.penalties > 0 ? `$${summary.penalties.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {summary.savings > 0 ? `$${summary.savings.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${summary.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important compliance tasks and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingDeadlines.map((deadline, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{deadline.task}</TableCell>
                    <TableCell>{deadline.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadge(deadline.priority)}>
                        {deadline.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(deadline.status)}>
                        {getStatusIcon(deadline.status)}
                        <span className="ml-1 capitalize">{deadline.status.replace('-', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Start Task
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
