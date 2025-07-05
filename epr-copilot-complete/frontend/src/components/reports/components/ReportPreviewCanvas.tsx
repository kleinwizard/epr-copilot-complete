
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Trash2,
  GripVertical
} from 'lucide-react';

interface ReportSection {
  id: string;
  componentId: string;
  name: string;
  type: string;
  settings: any;
  order: number;
}

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

interface ReportPreviewCanvasProps {
  sections: ReportSection[];
  onRemoveSection: (sectionId: string) => void;
  reportConfig?: ReportConfig;
  isPreviewMode?: boolean;
}

export function ReportPreviewCanvas({ sections, onRemoveSection, reportConfig, isPreviewMode = false }: ReportPreviewCanvasProps) {
  const getComponentPreview = (section: ReportSection) => {
    const dateRangeText = reportConfig?.filters.dateRange === 'quarter' ? 'Q4 2024' : 
                         reportConfig?.filters.dateRange === 'month' ? 'December 2024' : 
                         reportConfig?.filters.dateRange === 'year' ? '2024' : 'Custom Range';
    
    switch (section.componentId) {
      case 'summary-stats':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$2,847.32</div>
                <div className="text-sm text-gray-600">Total EPR Fees ({dateRangeText})</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Products Analyzed</div>
              </div>
            </div>
          </div>
        );
      case 'product-table':
        return (
          <div className="bg-gray-50 rounded p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b text-sm font-medium">
                <span>Product Name</span>
                <span>EPR Fee</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm">
                <span>Eco-Friendly Water Bottle</span>
                <span>$12.45</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm">
                <span>Organic Food Container</span>
                <span>$8.92</span>
              </div>
              <div className="flex justify-between items-center py-1 text-sm">
                <span>Recyclable Packaging Box</span>
                <span>$15.67</span>
              </div>
              <div className="text-xs text-gray-500 pt-2">Showing 3 of 12 products for {dateRangeText}</div>
            </div>
          </div>
        );
      case 'material-chart':
        return (
          <div className="bg-gray-50 rounded p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Plastic (PET)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div className="w-3/5 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cardboard</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div className="w-1/3 h-2 bg-green-500 rounded"></div>
                  </div>
                  <span className="text-sm">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Glass</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div className="w-1/12 h-2 bg-purple-500 rounded"></div>
                  </div>
                  <span className="text-sm">10%</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 pt-2">Material breakdown for {dateRangeText}</div>
            </div>
          </div>
        );
      case 'fee-analysis':
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Base Fees</span>
                <span className="text-sm font-medium">$2,450.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Eco-modulation</span>
                <span className="text-sm font-medium text-green-600">-$125.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Processing Fees</span>
                <span className="text-sm font-medium">$522.82</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-medium">Total ({dateRangeText})</span>
                <span className="font-bold text-lg">$2,847.32</span>
              </div>
            </div>
          </div>
        );
      case 'compliance-status':
        return (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Reporting Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Status</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Next Due Date</span>
                <span className="text-sm font-medium">March 31, 2025</span>
              </div>
              <div className="text-xs text-gray-500 pt-2">Status for {dateRangeText}</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
            <p className="text-xs">Preview will show actual data</p>
          </div>
        );
    }
  };
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Report Preview</CardTitle>
          {reportConfig && isPreviewMode && (
            <div className="text-sm text-muted-foreground">
              {reportConfig.filters.dateRange.charAt(0).toUpperCase() + reportConfig.filters.dateRange.slice(1)} Report
            </div>
          )}
        </div>
        {reportConfig && isPreviewMode && reportConfig.description && (
          <p className="text-sm text-muted-foreground mt-2">{reportConfig.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Add components from the left panel to build your report</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {!isPreviewMode && <GripVertical className="h-4 w-4 text-gray-400" />}
                      <span className="font-medium">{section.name}</span>
                      <Badge variant="outline">{section.type}</Badge>
                    </div>
                    {!isPreviewMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveSection(section.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  {isPreviewMode && reportConfig ? (
                    getComponentPreview(section)
                  ) : (
                    <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
                      {section.type === 'chart' && '📊 Chart Component'}
                      {section.type === 'table' && '📋 Table Component'}
                      {section.type === 'widget' && '📈 Widget Component'}
                      <p className="text-xs mt-1">Preview will show actual data</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
