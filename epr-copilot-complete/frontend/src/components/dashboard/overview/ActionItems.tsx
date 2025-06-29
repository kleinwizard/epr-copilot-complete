
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ActionItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <span>Urgent Action Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div>
            <p className="font-medium text-red-900">Missing packaging data for 23 products</p>
            <p className="text-sm text-red-700">Required for Q1 2025 submission</p>
          </div>
          <Button size="sm" variant="destructive">Fix Now</Button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div>
            <p className="font-medium text-orange-900">Q4 2024 report pending approval</p>
            <p className="text-sm text-orange-700">Due for submission in 5 days</p>
          </div>
          <Button size="sm" variant="outline">Review</Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div>
            <p className="font-medium text-yellow-900">Material library needs updating</p>
            <p className="text-sm text-yellow-700">New Oregon regulations effective Jan 1</p>
          </div>
          <Button size="sm" variant="outline">Update</Button>
        </div>
      </CardContent>
    </Card>
  );
}
