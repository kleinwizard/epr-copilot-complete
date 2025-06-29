
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Eye, 
  Recycle, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  Leaf
} from 'lucide-react';

interface Material {
  id: number;
  name: string;
  category: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  sustainabilityScore: number;
  complianceStatus: 'Compliant' | 'Restricted' | 'Banned';
  lastUpdated: string;
  description: string;
  carbonFootprint: number;
}

interface MaterialCardProps {
  material: Material;
  onViewDetails: () => void;
  onEdit: () => void;
}

export function MaterialCard({ material, onViewDetails, onEdit }: MaterialCardProps) {
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Restricted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <CheckCircle className="h-3 w-3" />;
      case 'Restricted':
      case 'Banned':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{material.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{material.category} • {material.type}</p>
            <Badge variant="outline" className="text-xs">
              {material.category}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">EPR Rate:</span>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">{(material.eprRate * 1000).toFixed(2)}/kg</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Recyclable:</span>
            <div className="flex items-center space-x-1">
              {material.recyclable ? (
                <Recycle className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-red-600" />
              )}
              <span>{material.recyclable ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Sustainability:</span>
            <div className="flex items-center space-x-1">
              <Leaf className="h-3 w-3 text-green-600" />
              <span className={`font-medium ${getSustainabilityColor(material.sustainabilityScore)}`}>
                {material.sustainabilityScore}/100
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Carbon:</span>
            <span className="font-medium">{material.carbonFootprint} kg CO₂/kg</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Badge className={`text-xs ${getComplianceColor(material.complianceStatus)}`}>
            <div className="flex items-center space-x-1">
              {getComplianceIcon(material.complianceStatus)}
              <span>{material.complianceStatus}</span>
            </div>
          </Badge>
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            Updated: {new Date(material.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
