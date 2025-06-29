
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
          <div>
            <p className="font-medium">Q3 2024 report submitted successfully</p>
            <p className="text-sm text-muted-foreground">2 hours ago</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="font-medium">85 products updated with new packaging weights</p>
            <p className="text-sm text-muted-foreground">1 day ago</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
          <div>
            <p className="font-medium">Team member Sarah added to compliance team</p>
            <p className="text-sm text-muted-foreground">3 days ago</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
          <div>
            <p className="font-medium">Fee calculation updated for plastic materials</p>
            <p className="text-sm text-muted-foreground">1 week ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
