
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Package, Recycle, AlertCircle } from 'lucide-react';

interface Material {
  type: string;
  weight: number;
  recyclable: boolean;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  weight: number;
  materials: Material[];
  status: string;
  lastUpdated: string;
  eprFee: number;
}

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Needs Update':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const recyclableCount = product.materials.filter(m => m.recyclable).length;
  const totalMaterials = product.materials.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
            <p className="text-xs text-gray-600 mb-2">SKU: {product.sku}</p>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Total Weight:</span>
            <span className="font-medium">{product.weight}g</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Materials:</span>
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>{product.materials.length}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Recyclable:</span>
            <div className="flex items-center space-x-1">
              <Recycle className="h-3 w-3 text-green-600" />
              <span>{recyclableCount}/{totalMaterials}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Est. EPR Fee:</span>
            <span className="font-medium">${product.eprFee.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge className={`text-xs ${getStatusColor(product.status)}`}>
            {product.status}
          </Badge>
          
          {product.status === 'Pending Review' && (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Updated: {new Date(product.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
