
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { ExportJob } from '../types/export';

interface ExportHistoryProps {
  exportJobs: ExportJob[];
}

export function ExportHistory({ exportJobs }: ExportHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exportJobs.map(job => (
            <div key={job.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <h4 className="font-medium">{job.name}</h4>
                </div>
                <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Format: {job.format}</span>
                  <span>Created: {job.createdAt}</span>
                </div>

                {job.status === 'processing' && (
                  <div className="space-y-1">
                    <Progress value={job.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{job.progress}% complete</p>
                  </div>
                )}

                {job.status === 'completed' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Size: {job.fileSize} • Completed: {job.completedAt}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}

                {job.status === 'failed' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Export failed</span>
                    <Button size="sm" variant="outline">
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
