
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Edit, 
  Download, 
  Tag, 
  Copy, 
  Archive,
  CheckSquare,
  Users,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBulkOperationsProps {
  selectedProducts: number[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

export function EnhancedBulkOperations({ 
  selectedProducts, 
  onClearSelection, 
  onBulkAction 
}: EnhancedBulkOperationsProps) {
  const [bulkAction, setBulkAction] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    category: '',
    tags: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleBulkAction = () => {
    if (!bulkAction) return;

    switch (bulkAction) {
      case 'delete':
        onBulkAction('delete');
        toast({
          title: "Products Deleted",
          description: `${selectedProducts.length} products have been deleted.`,
        });
        break;
      case 'activate':
        onBulkAction('updateStatus', 'Active');
        toast({
          title: "Products Activated",
          description: `${selectedProducts.length} products have been activated.`,
        });
        break;
      case 'archive':
        onBulkAction('updateStatus', 'Archived');
        toast({
          title: "Products Archived",
          description: `${selectedProducts.length} products have been archived.`,
        });
        break;
      case 'duplicate':
        onBulkAction('duplicate');
        toast({
          title: "Products Duplicated",
          description: `${selectedProducts.length} products have been duplicated.`,
        });
        break;
      case 'export':
        onBulkAction('export');
        toast({
          title: "Export Started",
          description: `Exporting ${selectedProducts.length} products...`,
        });
        break;
      case 'edit':
        setShowEditDialog(true);
        return;
      case 'assign':
        setShowAssignDialog(true);
        return;
    }
    
    setBulkAction('');
    onClearSelection();
  };

  const handleBulkEdit = () => {
    onBulkAction('bulkEdit', editData);
    setShowEditDialog(false);
    setBulkAction('');
    onClearSelection();
    toast({
      title: "Bulk Edit Complete",
      description: `${selectedProducts.length} products have been updated.`,
    });
  };

  if (selectedProducts.length === 0) return null;

  return (
    <>
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4" />
              <Badge variant="secondary">{selectedProducts.length} selected</Badge>
              <span>Bulk Operations</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear Selection
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edit">
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Bulk Edit</span>
                  </div>
                </SelectItem>
                <SelectItem value="activate">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Set Active</span>
                  </div>
                </SelectItem>
                <SelectItem value="archive">
                  <div className="flex items-center space-x-2">
                    <Archive className="h-4 w-4" />
                    <span>Archive</span>
                  </div>
                </SelectItem>
                <SelectItem value="duplicate">
                  <div className="flex items-center space-x-2">
                    <Copy className="h-4 w-4" />
                    <span>Duplicate</span>
                  </div>
                </SelectItem>
                <SelectItem value="assign">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Assign Team</span>
                  </div>
                </SelectItem>
                <SelectItem value="export">
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Selected</span>
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Selected</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleBulkAction} 
              disabled={!bulkAction}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              Apply Action
            </Button>

            {/* Quick Actions */}
            <div className="flex space-x-1 ml-4">
              <Button variant="outline" size="sm" onClick={() => onBulkAction('export')}>
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onBulkAction('duplicate')}>
                <Copy className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit {selectedProducts.length} Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Keep current status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending Review">Pending Review</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Keep current category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Personal Care">Personal Care</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Household">Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="organic, premium, eco-friendly"
                value={editData.tags}
                onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add notes to all selected products..."
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkEdit}>
                Update Products
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
