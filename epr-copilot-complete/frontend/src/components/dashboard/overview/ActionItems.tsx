
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, FileText } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { useEffect, useState } from 'react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

interface ActionItemsProps {
  onPageChange?: (page: string) => void;
}

export function ActionItems({ onPageChange }: ActionItemsProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      const products = await dataService.getProducts();
      const materials = await dataService.getMaterials();
      const company = await dataService.getCompanyInfo();
      
      const items: ActionItem[] = [];
      
      if (!company) {
        items.push({
          id: '1',
          title: 'Complete company setup',
          description: 'Add your company information to get started',
          priority: 'high',
          action: 'setup-company'
        });
      }
      
      if (products.length === 0) {
        items.push({
          id: '2',
          title: 'Add your first product',
          description: 'Start tracking EPR compliance by adding products',
          priority: 'high',
          action: 'add-product'
        });
      }
      
      if (materials.length === 0) {
        items.push({
          id: '3',
          title: 'Set up material library',
          description: 'Define materials for accurate fee calculations',
          priority: 'medium',
          action: 'add-materials'
        });
      }
      
      setActionItems(items);
    } catch (error) {
      console.error('Failed to load action items:', error);
      setActionItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-900';
      case 'medium': return 'bg-orange-50 text-orange-900';
      case 'low': return 'bg-yellow-50 text-yellow-900';
      default: return 'bg-gray-50 text-gray-900';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-orange-700';
      case 'low': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  const getButtonVariant = (priority: string) => {
    return priority === 'high' ? 'destructive' : 'outline';
  };

  const handleActionClick = (actionId: string, onPageChange?: (page: string) => void) => {
    switch (actionId) {
      case 'setup-company':
        if (onPageChange) {
          onPageChange('company');
        } else {
          window.location.hash = '#company';
        }
        break;
      case 'add-product':
        if (onPageChange) {
          onPageChange('product-catalog');
        } else {
          window.location.hash = '#product-catalog';
        }
        break;
      case 'add-materials':
        if (onPageChange) {
          onPageChange('materials');
        } else {
          window.location.hash = '#materials';
        }
        break;
      default:
        console.log(`Action clicked: ${actionId}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Action Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItems.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No action items</p>
            <p className="text-sm text-muted-foreground">All tasks are up to date</p>
          </div>
        ) : (
          actionItems.map((item) => (
            <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${getPriorityColor(item.priority)}`}>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className={`text-sm ${getPriorityTextColor(item.priority)}`}>{item.description}</p>
              </div>
              <Button 
                size="sm" 
                variant={getButtonVariant(item.priority)}
                onClick={() => handleActionClick(item.action, onPageChange)}
              >
                {item.priority === 'high' ? 'Start' : 'Review'}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
