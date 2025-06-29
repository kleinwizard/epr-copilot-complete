
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Table, Image, Archive } from 'lucide-react';
import type { AvailableReport, ExportFormat } from '../types/export';

interface ExportConfigurationProps {
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  selectedReports: string[];
  setSelectedReports: (reports: string[]) => void;
  includeCharts: boolean;
  setIncludeCharts: (include: boolean) => void;
  includeRawData: boolean;
  setIncludeRawData: (include: boolean) => void;
}

export function ExportConfiguration({
  selectedFormat,
  setSelectedFormat,
  selectedReports,
  setSelectedReports,
  includeCharts,
  setIncludeCharts,
  includeRawData,
  setIncludeRawData
}: ExportConfigurationProps) {
  const availableReports: AvailableReport[] = [
    { id: 'q1-2024', name: 'Q1 2024 Report', status: 'Submitted' },
    { id: 'q4-2023', name: 'Q4 2023 Report', status: 'Submitted' },
    { id: 'custom-1', name: 'Custom Material Analysis', status: 'Draft' }
  ];

  const exportFormats: ExportFormat[] = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Formatted report with charts' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: Table, description: 'Data tables with formulas' },
    { value: 'csv', label: 'CSV Data', icon: Archive, description: 'Raw data export' },
    { value: 'powerpoint', label: 'PowerPoint', icon: Image, description: 'Presentation format' }
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(
      selectedReports.includes(reportId)
        ? selectedReports.filter(id => id !== reportId)
        : [...selectedReports, reportId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium">Select Reports</h4>
          {availableReports.map(report => (
            <div key={report.id} className="flex items-center space-x-3">
              <Checkbox
                checked={selectedReports.includes(report.id)}
                onCheckedChange={() => handleReportToggle(report.id)}
              />
              <div className="flex-1">
                <p className="font-medium">{report.name}</p>
                <Badge variant="outline" className="text-xs">
                  {report.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Export Format</h4>
          <div className="grid grid-cols-1 gap-2">
            {exportFormats.map(format => {
              const IconComponent = format.icon;
              return (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFormat(format.value)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{format.label}</p>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Options</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <span className="text-sm">Include charts and visualizations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={includeRawData}
                onCheckedChange={(checked) => setIncludeRawData(checked === true)}
              />
              <span className="text-sm">Include raw data tables</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={selectedReports.length === 0 || !selectedFormat}
        >
          <Download className="h-4 w-4 mr-2" />
          Start Export
        </Button>
      </CardContent>
    </Card>
  );
}
