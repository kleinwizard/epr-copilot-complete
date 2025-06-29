
import { Card, CardContent } from '@/components/ui/card';
import { Package, BarChart3, AlertTriangle } from 'lucide-react';

interface ProductStatsProps {
  totalProducts: number;
  activeProducts: number;
  pendingReview: number;
  totalEprFees: number;
}

export function ProductStats({ totalProducts, activeProducts, pendingReview, totalEprFees }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Products</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalProducts}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Active Products</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-green-600">{activeProducts}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Pending Review</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{pendingReview}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Est. Monthly Fees</span>
          </div>
          <div className="text-2xl font-bold mt-1">${totalEprFees.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
