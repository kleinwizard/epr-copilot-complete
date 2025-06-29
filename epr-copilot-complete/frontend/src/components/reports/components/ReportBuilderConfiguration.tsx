
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface ReportBuilderConfigurationProps {
  reportConfig: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
}

export function ReportBuilderConfiguration({ reportConfig, onConfigChange }: ReportBuilderConfigurationProps) {
  const updateConfig = (updates: Partial<ReportConfig>) => {
    onConfigChange({ ...reportConfig, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Report Name</Label>
          <Input
            placeholder="Enter report name"
            value={reportConfig.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Describe this report template..."
            value={reportConfig.description}
            onChange={(e) => updateConfig({ description: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Base Template</Label>
          <Select value={reportConfig.template} onValueChange={(value) => updateConfig({ template: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Report</SelectItem>
              <SelectItem value="compliance">Compliance Report</SelectItem>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="operational">Operational Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
