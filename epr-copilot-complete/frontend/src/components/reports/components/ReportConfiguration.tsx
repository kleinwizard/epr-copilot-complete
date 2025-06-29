
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';

interface ReportFormData {
  quarter: string;
  year: number;
  region: string;
  includeProjections: boolean;
  includeAlternatives: boolean;
  autoOptimize: boolean;
  notes: string;
}

interface ReportConfigurationProps {
  formData: ReportFormData;
  onFormDataChange: (data: ReportFormData) => void;
}

export function ReportConfiguration({ formData, onFormDataChange }: ReportConfigurationProps) {
  const updateFormData = (updates: Partial<ReportFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Report Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quarter</Label>
            <Select value={formData.quarter} onValueChange={(value) => updateFormData({ quarter: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) => updateFormData({ year: parseInt(e.target.value) })}
              min="2020"
              max="2030"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={formData.region} onValueChange={(value) => updateFormData({ region: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oregon">Oregon</SelectItem>
              <SelectItem value="california">California</SelectItem>
              <SelectItem value="washington">Washington</SelectItem>
              <SelectItem value="maine">Maine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Advanced Options</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="projections"
                checked={formData.includeProjections}
                onCheckedChange={(checked) => updateFormData({ includeProjections: checked as boolean })}
              />
              <Label htmlFor="projections" className="text-sm">Include future projections</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alternatives"
                checked={formData.includeAlternatives}
                onCheckedChange={(checked) => updateFormData({ includeAlternatives: checked as boolean })}
              />
              <Label htmlFor="alternatives" className="text-sm">Include material alternatives analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="optimize"
                checked={formData.autoOptimize}
                onCheckedChange={(checked) => updateFormData({ autoOptimize: checked as boolean })}
              />
              <Label htmlFor="optimize" className="text-sm">Auto-optimize for cost reduction</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Add any specific notes or requirements for this report..."
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
