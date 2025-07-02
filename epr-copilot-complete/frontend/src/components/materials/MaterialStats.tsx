
import { Card, CardContent } from '@/components/ui/card';
import { Package2, CheckCircle, Recycle } from 'lucide-react';

interface MaterialStatsProps {
  totalMaterials: number;
  compliantMaterials: number;
  recyclableMaterials: number;
  avgSustainabilityScore: number;
}

export function MaterialStats({ 
  totalMaterials, 
  compliantMaterials, 
  recyclableMaterials, 
  avgSustainabilityScore 
}: MaterialStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Materials</span>
          </div>
          <div className="text-2xl font-bold mt-1">{totalMaterials}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Compliant</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-green-600">{compliantMaterials}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Recycle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Recyclable</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{recyclableMaterials}</div>
        </CardContent>
      </Card>
      
      {/* DISABLED: Sustainability Score feature disabled for initial launch */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-400">Avg. Score</span>
          </div>
          <div className="text-2xl font-bold mt-1 text-gray-400">Feature Disabled</div>
          <div className="text-xs text-gray-500 mt-1">Available in future release</div>
        </CardContent>
      </Card>
    </div>
  );
}
