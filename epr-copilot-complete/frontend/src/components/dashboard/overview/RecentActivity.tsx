
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  type: 'product' | 'material' | 'company' | 'report' | 'calculation';
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const products = await dataService.getProducts();
      const materials = await dataService.getMaterials();
      const company = await dataService.getCompanyInfo();
      
      const activities: ActivityItem[] = [];
      
      if (company) {
        activities.push({
          id: '1',
          action: 'Company profile completed',
          timestamp: 'Recently',
          type: 'company'
        });
      }
      
      if (products.length > 0) {
        activities.push({
          id: '2',
          action: `${products.length} product${products.length > 1 ? 's' : ''} added to catalog`,
          timestamp: 'Recently',
          type: 'product'
        });
      }
      
      if (materials.length > 0) {
        activities.push({
          id: '3',
          action: `${materials.length} material${materials.length > 1 ? 's' : ''} added to library`,
          timestamp: 'Recently',
          type: 'material'
        });
      }
      
      setActivities(activities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-500';
      case 'material': return 'bg-green-500';
      case 'company': return 'bg-purple-500';
      case 'report': return 'bg-orange-500';
      case 'calculation': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">Activity will appear here as you use the system</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
