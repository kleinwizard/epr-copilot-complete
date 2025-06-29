
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingDown, 
  Package, 
  Recycle,
  Calendar
} from 'lucide-react';
import type { FeeCalculation } from '@/services/feeCalculation';

interface FeeBreakdownProps {
  calculation: FeeCalculation;
  monthlyVolume: number;
  monthlyFee: number;
}

export function FeeBreakdown({ calculation, monthlyVolume, monthlyFee }: FeeBreakdownProps) {
  const recyclableWeight = calculation.materials
    .filter(m => m.recyclable)
    .reduce((sum, m) => sum + m.weight, 0);
  
  const recyclabilityPercentage = calculation.totalWeight > 0 
    ? (recyclableWeight / calculation.totalWeight) * 100 
    : 0;

  const quarterlyFee = monthlyFee * 3;
  const yearlyFee = monthlyFee * 12;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Per Unit Fee</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${calculation.totalFee.toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {calculation.totalWeight}g total weight
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Monthly Fee</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${monthlyFee.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyVolume.toLocaleString()} units/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Quarterly Fee</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${quarterlyFee.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Due 30 days after quarter end
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Recycle className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Recyclability</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {recyclabilityPercentage.toFixed(0)}%
            </div>
            <Progress value={recyclabilityPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fee Calculation Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Base Fee (before discounts)</span>
              <span className="font-bold">${calculation.breakdown.baseFee.toFixed(4)}</span>
            </div>
            
            {calculation.recyclabilityDiscount > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Recycle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Recyclability Discount (25%)</span>
                </div>
                <span className="font-bold text-green-700">
                  -${calculation.recyclabilityDiscount.toFixed(4)}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-bold text-blue-900">Final Fee Per Unit</span>
              <span className="font-bold text-blue-700 text-lg">
                ${calculation.totalFee.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Material-by-Material Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium">Material Breakdown</h4>
            <div className="space-y-2">
              {calculation.materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{material.type}</span>
                        {material.recyclable && (
                          <Badge variant="outline" className="text-green-700 bg-green-50">
                            Recyclable
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {material.weight}g • ${material.baseRate}/kg
                        {material.recyclable && <span className="text-green-600"> → ${material.adjustedRate}/kg</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${material.fee.toFixed(4)}</div>
                    {material.recyclable && material.baseRate !== material.adjustedRate && (
                      <div className="text-xs text-green-600">
                        Saved ${((material.weight / 1000) * (material.baseRate - material.adjustedRate)).toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Monthly</p>
              <p className="text-xl font-bold text-blue-700">${monthlyFee.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-900">Quarterly</p>
              <p className="text-xl font-bold text-orange-700">${quarterlyFee.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Yearly</p>
              <p className="text-xl font-bold text-purple-700">${yearlyFee.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
