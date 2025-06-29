
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Download, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkOperationsProps {
  selectedProducts: number[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

export function BulkOperations({ selectedProducts, onClearSelection, onBulkAction }: BulkOperationsProps) {
  const [bulkAction, setBulkAction] = useState('');
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
      case 'deactivate':
        onBulkAction('updateStatus', 'Inactive');
        toast({
          title: "Products Deactivated",
          description: `${selectedProducts.length} products have been deactivated.`,
        });
        break;
      case 'export':
        onBulkAction('export');
        toast({
          title: "Export Started",
          description: `Exporting ${selectedProducts.length} products...`,
        });
        break;
    }
    
    setBulkAction('');
    onClearSelection();
  };

  if (selectedProducts.length === 0) return null;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{selectedProducts.length} selected</Badge>
            <span>Bulk Operations</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activate">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Set Active</span>
                </div>
              </SelectItem>
              <SelectItem value="deactivate">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Set Inactive</span>
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
        </div>
      </CardContent>
    </Card>
  );
}
