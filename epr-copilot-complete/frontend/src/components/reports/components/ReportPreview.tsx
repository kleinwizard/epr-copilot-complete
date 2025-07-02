
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import { complianceLibraryService } from '@/services/complianceLibraryService';

interface ReportFormData {
  quarter: string;
  year: number;
  region: string;
  includeProjections: boolean;
  includeAlternatives: boolean;
  autoOptimize: boolean;
  notes: string;
}

interface ReportPreviewProps {
  formData: ReportFormData;
}

export function ReportPreview({ formData }: ReportPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Report Period</span>
            <span>{formData.quarter ? `${formData.quarter} ${formData.year}` : 'Not selected'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Jurisdiction</span>
            <span className="capitalize">{complianceLibraryService.getJurisdictionName(formData.region)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Estimated Products</span>
            <span>3 products</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Estimated Fees</span>
            <span>$2,276.75</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Included Sections</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Product inventory and packaging details</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Material composition analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>EPR fee calculations</span>
            </div>
            {formData.includeProjections && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Future period projections</span>
              </div>
            )}
            {formData.includeAlternatives && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Material alternatives analysis</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Estimated generation time: 2-3 minutes</span>
          </div>
          {formData.quarter && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-600">
                Due date: {new Date(formData.year, formData.quarter === 'Q1' ? 3 : formData.quarter === 'Q2' ? 6 : formData.quarter === 'Q3' ? 9 : 0, 30).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
