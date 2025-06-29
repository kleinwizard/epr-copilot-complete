
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportConfig {
  name: string;
  description: string;
  template: string;
  sections: any[];
  filters: {
    dateRange: string;
    categories: string[];
    regions: string[];
  };
}

interface DataFiltersProps {
  reportConfig: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
}

export function DataFilters({ reportConfig, onConfigChange }: DataFiltersProps) {
  const updateFilters = (updates: Partial<ReportConfig['filters']>) => {
    onConfigChange({
      ...reportConfig,
      filters: { ...reportConfig.filters, ...updates }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select 
            value={reportConfig.filters.dateRange} 
            onValueChange={(value) => updateFilters({ dateRange: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Product Categories</Label>
          <div className="space-y-1">
            {['Food & Beverage', 'Personal Care', 'Electronics', 'Household'].map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox id={category} />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
