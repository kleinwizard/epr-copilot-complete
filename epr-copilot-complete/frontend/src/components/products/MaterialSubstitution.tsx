import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  TrendingDown, 
  TrendingUp, 
  Recycle, 
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaterialAlternative {
  id: string;
  name: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  costImpact: number; // percentage change
  complianceImpact: number; // score change
  availabilityScore: number; // 1-100
  implementationTime: string;
  suppliers: string[];
  sustainabilityScore: number;
  carbonFootprint: number;
  pros: string[];
  cons: string[];
}

interface MaterialSubstitutionProps {
  currentMaterial: {
    type: string;
    weight: number;
    recyclable: boolean;
    eprRate: number;
  };
  onSelectAlternative: (alternative: MaterialAlternative) => void;
}

const mockAlternatives: MaterialAlternative[] = [
  {
    id: '1',
    name: 'rPET (Recycled PET)',
    type: 'Plastic',
    recyclable: true,
    eprRate: 0.0025,
    costImpact: 15,
    complianceImpact: 12,
    availabilityScore: 85,
    implementationTime: '2-3 months',
    suppliers: ['EcoPlastics Inc', 'Green Materials Co', 'Sustainable Packaging Ltd'],
    sustainabilityScore: 88,
    carbonFootprint: 1.8,
    pros: ['Higher recyclability', 'Lower EPR fees', 'Brand sustainability boost'],
    cons: ['Higher material cost', 'Limited color options', 'Requires supplier qualification']
  },
  {
    id: '2',
    name: 'Glass (Clear)',
    type: 'Glass',
    recyclable: true,
    eprRate: 0.0012,
    costImpact: -5,
    complianceImpact: 18,
    availabilityScore: 95,
    implementationTime: '1-2 months',
    suppliers: ['O-I Glass', 'Vetropack', 'Ardagh Group'],
    sustainabilityScore: 92,
    carbonFootprint: 0.85,
    pros: ['Premium appearance', 'Infinitely recyclable', 'Lower EPR fees'],
    cons: ['Heavier shipping costs', 'Breakage risk', 'Higher tooling costs']
  },
  {
    id: '3',
    name: 'Aluminum',
    type: 'Metal',
    recyclable: true,
    eprRate: 0.0008,
    costImpact: 25,
    complianceImpact: 22,
    availabilityScore: 90,
    implementationTime: '3-4 months',
    suppliers: ['Ball Corporation', 'Crown Holdings', 'Silgan Containers'],
    sustainabilityScore: 95,
    carbonFootprint: 1.2,
    pros: ['Highest recyclability', 'Lowest EPR fees', 'Lightweight option'],
    cons: ['Significant cost increase', 'Design limitations', 'Longer lead times']
  }
];

export function MaterialSubstitution({ currentMaterial, onSelectAlternative }: MaterialSubstitutionProps) {
  const [alternatives] = useState<MaterialAlternative[]>(mockAlternatives);
  const [selectedAlternative, setSelectedAlternative] = useState<MaterialAlternative | null>(null);
  const { toast } = useToast();

  const calculateSavings = (alternative: MaterialAlternative) => {
    const currentFee = currentMaterial.weight * currentMaterial.eprRate;
    const newFee = currentMaterial.weight * alternative.eprRate;
    return currentFee - newFee;
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAvailabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSelectAlternative = (alternative: MaterialAlternative) => {
    onSelectAlternative(alternative);
    toast({
      title: "Alternative Selected",
      description: `${alternative.name} has been selected as the material alternative.`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Lightbulb className="h-4 w-4 mr-2" />
          Find Alternatives
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Material Substitution Wizard</span>
          </DialogTitle>
          <DialogDescription>
            Find sustainable alternatives for {currentMaterial.type}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="alternatives" className="w-full">
          <TabsList>
            <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
            <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="alternatives" className="space-y-4">
            {/* Current Material Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p>{currentMaterial.type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Recyclable:</span>
                    <p>{currentMaterial.recyclable ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="font-medium">EPR Rate:</span>
                    <p>${currentMaterial.eprRate}/g</p>
                  </div>
                  <div>
                    <span className="font-medium">Current Fee:</span>
                    <p>${(currentMaterial.weight * currentMaterial.eprRate).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternatives Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {alternatives.map((alternative) => (
                <Card key={alternative.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{alternative.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{alternative.type}</Badge>
                          {alternative.recyclable && (
                            <Badge className="bg-green-100 text-green-800">
                              <Recycle className="h-3 w-3 mr-1" />
                              Recyclable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Impact Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Cost Impact:</span>
                        <div className={`flex items-center space-x-1 ${getImpactColor(alternative.costImpact)}`}>
                          {alternative.costImpact > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{Math.abs(alternative.costImpact)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Compliance:</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+{alternative.complianceImpact}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>EPR Savings:</span>
                        <div className="flex items-center space-x-1 text-green-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${calculateSavings(alternative).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Availability:</span>
                        <div className={`flex items-center space-x-1 ${getAvailabilityColor(alternative.availabilityScore)}`}>
                          <span>{alternative.availabilityScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Sustainability Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Sustainability Score</span>
                        <span className="font-medium">{alternative.sustainabilityScore}/100</span>
                      </div>
                      <Progress value={alternative.sustainabilityScore} className="h-2" />
                    </div>

                    {/* Implementation Time */}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Implementation: {alternative.implementationTime}</span>
                    </div>

                    {/* Suppliers */}
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Suppliers:</span>
                      <div className="flex flex-wrap gap-1">
                        {alternative.suppliers.slice(0, 2).map((supplier, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {supplier}
                          </Badge>
                        ))}
                        {alternative.suppliers.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{alternative.suppliers.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedAlternative(alternative)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSelectAlternative(alternative)}
                      >
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {selectedAlternative ? (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis: {selectedAlternative.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Advantages</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedAlternative.pros.map((pro, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Considerations</span>
                      </h4>
                      <ul className="space-y-2">
                        {selectedAlternative.cons.map((con, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Financial Impact */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Financial Impact Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current EPR Fee:</span>
                        <p className="font-medium">${(currentMaterial.weight * currentMaterial.eprRate).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">New EPR Fee:</span>
                        <p className="font-medium">${(currentMaterial.weight * selectedAlternative.eprRate).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Annual Savings:</span>
                        <p className="font-medium text-green-600">
                          ${(calculateSavings(selectedAlternative) * 12).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select an alternative to view detailed analysis
              </div>
            )}
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            {selectedAlternative ? (
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Plan: {selectedAlternative.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Implementation Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Supplier qualification: 2-4 weeks</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Sample testing: 1-2 weeks</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">Production setup: 2-3 weeks</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Full production: {selectedAlternative.implementationTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Information */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Recommended Suppliers</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedAlternative.suppliers.map((supplier, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{supplier}</span>
                            <Badge variant="outline">Verified</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Lead time: 4-6 weeks
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Next Steps</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-3 w-3" />
                        <span>Contact suppliers for quotes and samples</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-3 w-3" />
                        <span>Update product specifications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-3 w-3" />
                        <span>Schedule implementation review</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => handleSelectAlternative(selectedAlternative)}
                  >
                    Proceed with Implementation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select an alternative to view implementation plan
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
