
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

const mockImportHistory: ImportRecord[] = [
  {
    id: 1,
    fileName: 'products_batch_1.csv',
    type: 'products',
    date: '2024-01-22T10:30:00Z',
    status: 'completed',
    totalRecords: 150,
    successfulRecords: 148,
    failedRecords: 2
  },
  {
    id: 2,
    fileName: 'materials_update.csv',
    type: 'materials',
    date: '2024-01-21T14:15:00Z',
    status: 'completed',
    totalRecords: 45,
    successfulRecords: 45,
    failedRecords: 0
  },
  {
    id: 3,
    fileName: 'products_new_line.csv',
    type: 'products',
    date: '2024-01-20T09:45:00Z',
    status: 'failed',
    totalRecords: 75,
    successfulRecords: 0,
    failedRecords: 75
  }
];

export function ImportHistory() {
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

  const downloadErrorReport = (importId: number) => {
    // Simulate downloading error report
    console.log(`Downloading error report for import ${importId}`);
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
          <div className="space-y-4">
            {mockImportHistory.map((record) => (
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

            {mockImportHistory.length === 0 && (
              <div className="text-center py-8">
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No imports yet</h3>
                <p className="text-gray-600">Your import history will appear here once you start importing files.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
