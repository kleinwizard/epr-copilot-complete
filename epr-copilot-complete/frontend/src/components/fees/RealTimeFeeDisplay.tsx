
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealTimeFeeCalculation } from '@/hooks/useRealTimeFeeCalculation';
import { EnhancedMaterial } from '@/services/enhancedFeeCalculation';

interface RealTimeFeeDisplayProps {
  productId: string;
  materials: EnhancedMaterial[];
  volume?: number;
  region?: string;
  showBreakdown?: boolean;
}

export function RealTimeFeeDisplay({
  productId,
  materials,
  volume = 1,
  region = 'oregon',
  showBreakdown = true
}: RealTimeFeeDisplayProps) {
  const { result, isCalculating, error, refresh } = useRealTimeFeeCalculation({
    productId,
    materials,
    volume,
    region
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <Calculator className="h-4 w-4" />
            <span className="text-sm">Calculation Error: {error}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>Real-Time Fee Calculator</span>
            {isCalculating && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {result && (
              <Badge variant="outline" className="text-xs">
                Updated {formatTime(result.lastUpdated)}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCalculating && !result ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : result ? (
          <>
            {/* Total Fee Display */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total EPR Fee</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(result.totalFee)}
                  </p>
                  {volume > 1 && (
                    <p className="text-xs text-blue-600">
                      {formatCurrency(result.totalFee / volume)} per unit × {volume} units
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm">
                    {result.discounts > 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">
                          -{formatCurrency(result.discounts)} saved
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">No discounts</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            {showBreakdown && result.breakdown.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Material Breakdown</h4>
                <div className="space-y-2">
                  {result.breakdown.map((material) => (
                    <div
                      key={material.materialId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{material.type}</span>
                            {material.recyclable && (
                              <Badge variant="outline" className="text-green-700 bg-green-50 text-xs">
                                Recyclable
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {material.weight}g • ${material.adjustedRate.toFixed(4)}/kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {formatCurrency(material.fee)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t">
              <div className="text-center">
                <p className="text-xs text-gray-600">Base Fee</p>
                <p className="font-medium">{formatCurrency(result.baseFee)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Discounts</p>
                <p className="font-medium text-green-600">
                  -{formatCurrency(result.discounts)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Final Fee</p>
                <p className="font-medium text-blue-600">
                  {formatCurrency(result.totalFee)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Add materials to calculate fees</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
