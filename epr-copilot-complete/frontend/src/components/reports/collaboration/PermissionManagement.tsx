
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PermissionManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Viewer</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View report content</li>
                <li>• Read comments</li>
                <li>• Export reports</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Editor</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All Viewer permissions</li>
                <li>• Edit report content</li>
                <li>• Add/edit comments</li>
                <li>• Suggest changes</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Reviewer</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All Editor permissions</li>
                <li>• Approve/reject changes</li>
                <li>• Manage collaborators</li>
                <li>• Submit reports</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
