
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateEnhancedReport } from '@/services/enhancedReportService';
import type { QuarterlyReport } from '@/services/reportService';
import { ReportConfiguration } from './components/ReportConfiguration';
import { ReportPreview } from './components/ReportPreview';
import { GenerationProgress } from './components/GenerationProgress';

interface ReportGeneratorProps {
  onBack: () => void;
  onReportCreated: (report: QuarterlyReport) => void;
}

interface ReportFormData {
  quarter: string;
  year: number;
  region: string;
  includeProjections: boolean;
  includeAlternatives: boolean;
  autoOptimize: boolean;
  notes: string;
}

export function ReportGenerator({ onBack, onReportCreated }: ReportGeneratorProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    quarter: '',
    year: new Date().getFullYear(),
    region: 'oregon',
    includeProjections: false,
    includeAlternatives: false,
    autoOptimize: true,
    notes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!formData.quarter) {
      toast({
        title: "Missing Information",
        description: "Please select a quarter",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate report generation with progress
    const steps = [
      'Collecting product data...',
      'Calculating EPR fees...',
      'Analyzing material composition...',
      'Generating compliance metrics...',
      'Creating summary reports...',
      'Finalizing report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate the report using mock data
    const mockProducts = [
      {
        id: 1,
        name: 'Organic Pasta Sauce',
        sku: 'OPS-001',
        category: 'Food & Beverage',
        totalWeight: 680,
        materials: [
          { type: 'Glass', weight: 450, recyclable: true, eprRate: 0.15, fee: 67.5 },
          { type: 'Metal (Steel)', weight: 30, recyclable: true, eprRate: 0.22, fee: 6.6 },
          { type: 'Paper (Label)', weight: 15, recyclable: true, eprRate: 0.12, fee: 1.8 }
        ],
        unitsSold: 15000,
        totalFee: 0
      }
    ];

    const report = generateEnhancedReport(
      formData.quarter,
      formData.year,
      mockProducts,
      formData.region
    );

    setIsGenerating(false);
    onReportCreated(report);
    
    toast({
      title: "Report Generated",
      description: `${formData.quarter} ${formData.year} report has been created successfully`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Generate New Report</h2>
          <p className="text-muted-foreground">Create a comprehensive EPR compliance report</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportConfiguration formData={formData} onFormDataChange={setFormData} />
        <ReportPreview formData={formData} />
      </div>

      {isGenerating && <GenerationProgress progress={progress} />}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating || !formData.quarter}>
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </div>
  );
}
