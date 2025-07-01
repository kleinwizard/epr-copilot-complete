
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calculator, 
  Upload, 
  Download, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  priority: 'high' | 'medium' | 'low';
  category: 'report' | 'data' | 'compliance' | 'optimization';
  estimatedTime?: string;
}

const getZeroStateActions = (): QuickAction[] => [
  {
    id: '1',
    title: 'Add Your First Product',
    description: 'Start by adding product information',
    icon: <Upload className="h-4 w-4" />,
    action: 'add-product',
    priority: 'high',
    category: 'data',
    estimatedTime: '5 min'
  },
  {
    id: '2',
    title: 'Set Up Company Profile',
    description: 'Complete your company information',
    icon: <FileText className="h-4 w-4" />,
    action: 'setup-company',
    priority: 'high',
    category: 'data',
    estimatedTime: '10 min'
  },
  {
    id: '3',
    title: 'Learn About EPR Compliance',
    description: 'Understand EPR requirements and deadlines',
    icon: <Calendar className="h-4 w-4" />,
    action: 'learn-epr',
    priority: 'medium',
    category: 'compliance',
    estimatedTime: '15 min'
  }
];

const getActionsWithData = (userData: any): QuickAction[] => [
  {
    id: '1',
    title: 'Generate Quarterly Report',
    description: 'Create compliance report for current quarter',
    icon: <FileText className="h-4 w-4" />,
    action: 'generate-report',
    priority: 'high',
    category: 'report',
    estimatedTime: '2 min'
  },
  {
    id: '2',
    title: 'Calculate Fee Impact',
    description: 'Analyze current EPR fee calculations',
    icon: <Calculator className="h-4 w-4" />,
    action: 'calculate-fees',
    priority: 'medium',
    category: 'optimization',
    estimatedTime: '5 min'
  },
  {
    id: '3',
    title: 'Schedule Compliance Review',
    description: 'Book monthly compliance check meeting',
    icon: <Calendar className="h-4 w-4" />,
    action: 'schedule-review',
    priority: 'medium',
    category: 'compliance',
    estimatedTime: '3 min'
  }
];

export function QuickActionsPanel() {
  const { toast } = useToast();
  const [quickActions, setQuickActions] = useState<QuickAction[]>(getZeroStateActions());
  const [recentActions, setRecentActions] = useState<Array<{ action: string; time: string; status: string }>>([]);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const products = await dataService.getProducts();
      const materials = await dataService.getMaterials();
      
      if (products.length === 0 && materials.length === 0) {
        setQuickActions(getZeroStateActions());
        setRecentActions([]);
      } else {
        setQuickActions(getActionsWithData({ products, materials }));
        setRecentActions([
          { action: 'Product Data Updated', time: '1 day ago', status: 'completed' },
          { action: 'Fee Calculation Run', time: '3 days ago', status: 'completed' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load actions:', error);
      setQuickActions(getZeroStateActions());
      setRecentActions([]);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-product':
        toast({
          title: "Product Setup",
          description: "Navigate to Product Catalog to add your first product...",
        });
        break;
      case 'setup-company':
        toast({
          title: "Company Setup",
          description: "Navigate to Company Setup to complete your profile...",
        });
        break;
      case 'learn-epr':
        toast({
          title: "EPR Learning Resources",
          description: "Opening EPR compliance guide and resources...",
        });
        break;
      case 'generate-report':
        toast({
          title: "Report Generation Started",
          description: "Generating quarterly compliance report. This may take a few minutes...",
        });
        break;
      case 'calculate-fees':
        toast({
          title: "Fee Calculation Started",
          description: "Analyzing current EPR fee calculations...",
        });
        break;
      case 'schedule-review':
        toast({
          title: "Compliance Review Scheduled",
          description: "Monthly compliance check meeting scheduled for next week.",
        });
        break;
      default:
        toast({
          title: "Action Started",
          description: `Executing ${action}...`,
        });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low': return <Badge variant="outline" className="text-xs">Low</Badge>;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'report': return <FileText className="h-3 w-3" />;
      case 'data': return <Upload className="h-3 w-3" />;
      case 'compliance': return <CheckCircle className="h-3 w-3" />;
      case 'optimization': return <TrendingUp className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>Smart suggestions based on your current workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priority Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span>Recommended Actions</span>
          </h4>
          {quickActions.slice(0, 3).map((action) => (
            <div
              key={action.id}
              className={`p-3 rounded-lg border transition-colors hover:shadow-sm ${getPriorityColor(action.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span className="font-medium text-sm">{action.title}</span>
                  {getPriorityBadge(action.priority)}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{action.estimatedTime}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getCategoryIcon(action.category)}
                  <span className="capitalize">{action.category}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs"
                  onClick={() => handleQuickAction(action.action)}
                >
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* All Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">All Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickActions.slice(3).map((action) => (
              <div key={action.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span className="text-sm">{action.title}</span>
                  {getPriorityBadge(action.priority)}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs"
                  onClick={() => handleQuickAction(action.action)}
                >
                  Do
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Recent Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          {recentActions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground">Actions will appear here as you use the system</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActions.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{item.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full" variant="outline">
          View All Actions
        </Button>
      </CardContent>
    </Card>
  );
}
