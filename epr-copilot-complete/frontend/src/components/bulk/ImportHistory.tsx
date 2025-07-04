
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileSpreadsheet, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface ImportRecord {
  id: number;
  fileName: string;
  type: 'products' | 'materials';
  date: string;
  status: 'completed' | 'failed' | 'processing';
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
}

export function ImportHistory() {
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getImportHistory();
      setImportHistory(data || []);
    } catch (error) {
      console.error('Failed to load import history:', error);
      toast({
        title: "Error",
        description: "Failed to load import history.",
        variant: "destructive",
      });
      setImportHistory([]);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadErrorReport = async (importId: number) => {
    try {
      const response = await apiService.downloadErrorReport(importId);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import_${importId}_errors.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: "Error report has been downloaded.",
      });
    } catch (error) {
      console.error('Failed to download error report:', error);
      toast({
        title: "Error",
        description: "Failed to download error report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Import History</span>
          </CardTitle>
          <CardDescription>
            View and manage your previous bulk import operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading import history...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {importHistory.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{record.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()} at{' '}
                        {new Date(record.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {record.type}
                    </Badge>
                    <Badge className={getStatusColor(record.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(record.status)}
                        <span className="capitalize">{record.status}</span>
                      </div>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-lg font-bold">{record.totalRecords}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-lg font-bold text-green-700">{record.successfulRecords}</p>
                    <p className="text-xs text-green-600">Success</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-lg font-bold text-red-700">{record.failedRecords}</p>
                    <p className="text-xs text-red-600">Failed</p>
                  </div>
                </div>

                {record.failedRecords > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadErrorReport(record.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Report
                  </Button>
                )}
              </div>
            ))}

              {importHistory.length === 0 && (
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No imports yet</h3>
                  <p className="text-gray-600">Your import history will appear here once you start importing files.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
