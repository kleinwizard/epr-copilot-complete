
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Table, 
  FileText,
  Settings
} from 'lucide-react';

const availableComponents = [
  {
    id: 'summary-stats',
    name: 'Summary Statistics',
    type: 'widget',
    icon: BarChart3,
    description: 'Overview metrics and KPIs'
  },
  {
    id: 'product-table',
    name: 'Product Table',
    type: 'table',
    icon: Table,
    description: 'Detailed product listing'
  },
  {
    id: 'material-chart',
    name: 'Material Breakdown Chart',
    type: 'chart',
    icon: BarChart3,
    description: 'Visual material composition'
  },
  {
    id: 'fee-analysis',
    name: 'Fee Analysis',
    type: 'widget',
    icon: FileText,
    description: 'Cost breakdown and projections'
  },
  {
    id: 'compliance-status',
    name: 'Compliance Status',
    type: 'widget',
    icon: Settings,
    description: 'Regulatory compliance overview'
  }
];

interface ComponentLibraryProps {
  onAddSection: (component: any) => void;
}

export function ComponentLibrary({ onAddSection }: ComponentLibraryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Components</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {availableComponents.map((component) => (
            <div
              key={component.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onAddSection(component)}
            >
              <div className="flex items-center space-x-2 mb-1">
                <component.icon className="h-4 w-4" />
                <span className="font-medium text-sm">{component.name}</span>
              </div>
              <p className="text-xs text-gray-600">{component.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
