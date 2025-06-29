
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

interface ReportPreviewCanvasProps {
  sections: ReportSection[];
  onRemoveSection: (sectionId: string) => void;
}

export function ReportPreviewCanvas({ sections, onRemoveSection }: ReportPreviewCanvasProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Report Preview</CardTitle>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{section.name}</span>
                      <Badge variant="outline">{section.type}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSection(section.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
                    {section.type === 'chart' && '📊 Chart Component'}
                    {section.type === 'table' && '📋 Table Component'}
                    {section.type === 'widget' && '📈 Widget Component'}
                    <p className="text-xs mt-1">Preview will show actual data</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
