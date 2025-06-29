
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CollaborationHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Q1 2024 Report - Completed</span>
              <span className="text-sm text-gray-600">3 weeks ago</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Collaborated with 4 team members • 23 comments • Final submission
            </p>
          </div>
          <div className="p-3 border-l-4 border-green-500 bg-green-50">
            <div className="flex items-center justify-between">
              <span className="font-medium">Q4 2023 Report - Approved</span>
              <span className="text-sm text-gray-600">2 months ago</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Collaborated with 3 team members • 15 comments • Regulatory approval received
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
