
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Table, Archive } from 'lucide-react';

export function ExportQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Export All Reports (PDF)
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Table className="h-4 w-4 mr-2" />
          Export Data Tables (Excel)
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Archive className="h-4 w-4 mr-2" />
          Download Raw Data (CSV)
        </Button>
      </CardContent>
    </Card>
  );
}
