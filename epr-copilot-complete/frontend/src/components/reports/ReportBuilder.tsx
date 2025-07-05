
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Eye } from 'lucide-react';
import { ReportBuilderConfiguration } from './components/ReportBuilderConfiguration';
import { ComponentLibrary } from './components/ComponentLibrary';
import { DataFilters } from './components/DataFilters';
import { ReportPreviewCanvas } from './components/ReportPreviewCanvas';
import { useToast } from '@/hooks/use-toast';

interface ReportBuilderProps {
  onBack: () => void;
  onSaveReport: (report: any) => void;
}

export function ReportBuilder({ onBack, onSaveReport }: ReportBuilderProps) {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    template: 'custom',
    sections: [] as any[],
    filters: {
      dateRange: 'quarter',
      categories: [] as string[],
      regions: [] as string[]
    }
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const addSection = (component: any) => {
    const newSection = {
      id: Date.now().toString(),
      componentId: component.id,
      name: component.name,
      type: component.type,
      settings: {},
      order: reportConfig.sections.length
    };
    
    setReportConfig(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    setReportConfig(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleSave = () => {
    if (!reportConfig.name) {
      toast({
        title: "Report Name Required",
        description: "Please enter a name for your report template.",
        variant: "destructive",
      });
      return;
    }
    
    onSaveReport(reportConfig);
    toast({
      title: "Report Template Saved",
      description: `"${reportConfig.name}" has been saved successfully.`,
    });
  };

  const handlePreview = () => {
    if (reportConfig.sections.length === 0) {
      toast({
        title: "No Sections Added",
        description: "Add some components to your report before previewing.",
        variant: "destructive",
      });
      return;
    }
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6" data-tutorial="report-builder">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Report Builder</h2>
            <p className="text-muted-foreground">Create custom compliance reports</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Preview</DialogTitle>
                <DialogDescription>
                  Preview of "{reportConfig.name || 'Untitled Report'}" with current configuration
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <ReportPreviewCanvas 
                  sections={reportConfig.sections} 
                  onRemoveSection={removeSection}
                  reportConfig={reportConfig}
                  isPreviewMode={true}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={!reportConfig.name}>
            Save Report Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-4">
          <ReportBuilderConfiguration 
            reportConfig={reportConfig} 
            onConfigChange={setReportConfig} 
          />
          <ComponentLibrary onAddSection={addSection} />
          <DataFilters 
            reportConfig={reportConfig} 
            onConfigChange={setReportConfig} 
          />
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-2">
          <ReportPreviewCanvas 
            sections={reportConfig.sections} 
            onRemoveSection={removeSection} 
          />
        </div>
      </div>
    </div>
  );
}
