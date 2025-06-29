
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Edit,
  Recycle,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Leaf,
  Package2,
  TrendingUp,
  Info
} from 'lucide-react';

interface Material {
  id: number;
  name: string;
  category: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  densityRange: { min: number; max: number };
  sustainabilityScore: number;
  alternatives: string[];
  complianceStatus: 'Compliant' | 'Restricted' | 'Banned';
  lastUpdated: string;
  description: string;
  carbonFootprint: number;
  recyclingProcess: string;
  endOfLife: string[];
}

interface MaterialDetailsProps {
  material: Material;
  onBack: () => void;
  onEdit: () => void;
}

export function MaterialDetails({ material, onBack, onEdit }: MaterialDetailsProps) {
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Restricted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Banned':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return <CheckCircle className="h-4 w-4" />;
      case 'Restricted':
      case 'Banned':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{material.name}</h1>
            <p className="text-gray-600">{material.category} • {material.type}</p>
          </div>
        </div>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Material
        </Button>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Material Overview</CardTitle>
            <CardDescription>{material.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">EPR Rate</p>
                <p className="text-lg font-bold text-blue-700">${(material.eprRate * 1000).toFixed(3)}/kg</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Leaf className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-green-900">Sustainability</p>
                <p className={`text-lg font-bold ${getSustainabilityColor(material.sustainabilityScore)}`}>
                  {material.sustainabilityScore}/100
                </p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Carbon Footprint</p>
                <p className="text-lg font-bold text-purple-700">{material.carbonFootprint} kg CO₂/kg</p>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Package2 className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium text-orange-900">Density Range</p>
                <p className="text-lg font-bold text-orange-700">{material.densityRange.min}-{material.densityRange.max} g/cm³</p>
              </div>
            </div>

            {/* Sustainability Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Sustainability Score</span>
                <span className={`text-sm font-bold ${getSustainabilityColor(material.sustainabilityScore)}`}>
                  {material.sustainabilityScore}/100
                </span>
              </div>
              <Progress value={material.sustainabilityScore} className="h-2" />
              <p className="text-xs text-gray-600 mt-1">
                Based on recyclability, carbon footprint, and end-of-life options
              </p>
            </div>

            {/* Recycling Information */}
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Recycle className="h-4 w-4 mr-2" />
                Recycling Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recyclable:</span>
                  <div className="flex items-center space-x-1">
                    {material.recyclable ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">No</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Process:</span>
                  <p className="text-sm mt-1">{material.recyclingProcess}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">End-of-Life Options:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {material.endOfLife.map((option, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Alternatives */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-3 rounded-lg border ${getComplianceColor(material.complianceStatus)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {getComplianceIcon(material.complianceStatus)}
                  <span className="font-medium">{material.complianceStatus}</span>
                </div>
                {material.complianceStatus === 'Restricted' && (
                  <p className="text-xs">This material has usage restrictions under Oregon EPR regulations.</p>
                )}
                {material.complianceStatus === 'Banned' && (
                  <p className="text-xs">This material is not permitted under current Oregon EPR regulations.</p>
                )}
                {material.complianceStatus === 'Compliant' && (
                  <p className="text-xs">This material meets all current Oregon EPR requirements.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sustainable Alternatives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sustainable Alternatives</CardTitle>
            </CardHeader>
            <CardContent>
              {material.alternatives.length > 0 ? (
                <div className="space-y-2">
                  {material.alternatives.map((alternative, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {alternative}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No alternatives available</p>
              )}
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Info className="h-4 w-4" />
                <span>Last updated: {new Date(material.lastUpdated).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
