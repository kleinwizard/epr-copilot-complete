
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { ValidationService } from '@/services/validationService';
import { ValidationMessage } from '@/components/common/ValidationMessage';

interface Material {
  id?: number;
  name: string;
  category: string;
  materialType: string;
  packagingComponentType: string;
  description: string;
  pcrContent: number;
  recyclable: string;
  eprRate: number;
  carbonFootprint: number;
  sustainabilityScore: number;
  recyclingProcess: string;
  sustainableAlternatives: string;
  lastUpdated: string;
}

interface MaterialFormProps {
  material?: Material | null;
  onSave: (material: Partial<Material>) => void;
  onCancel: () => void;
}

const materialTypeOptions = {
  Plastic: ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Other'],
  'Paper/Fiber': ['Cardboard', 'Paperboard', 'Corrugated', 'Kraft Paper', 'Other'],
  Glass: ['Clear Glass', 'Colored Glass', 'Borosilicate', 'Other'],
  Metal: ['Aluminum', 'Steel', 'Tin', 'Other'],
  Other: ['Composite', 'Biodegradable', 'Other']
};

const tooltips = {
  materialName: "The common name for this material as it appears on your packaging.",
  category: "The broad material category that best describes this material.",
  materialType: "The specific type of material within the selected category.",
  packagingComponentType: "The role this material plays in your product packaging.",
  description: "Optional notes about this material for your reference.",
  pcrContent: "The percentage of post-consumer recycled content in this material.",
  recyclable: "Whether this material can be recycled in most jurisdictions, determined by material type and local recycling capabilities.",
  eprRate: "The fee rate per gram charged by EPR programs, based on material type and recyclability.",
  carbonFootprint: "The CO₂ emissions per kilogram of this material, from production to disposal.",
  sustainabilityScore: "A composite score (1-100) based on recyclability, PCR content, and carbon footprint.",
  recyclingProcess: "How this material is typically processed in recycling facilities.",
  sustainableAlternatives: "More environmentally friendly alternatives to consider for this material."
};

export function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Material>>({
    name: material?.name || '',
    category: material?.category || '',
    materialType: material?.materialType || '',
    packagingComponentType: material?.packagingComponentType || '',
    description: material?.description || '',
    pcrContent: material?.pcrContent || 0,
    recyclable: material?.recyclable || '',
    eprRate: material?.eprRate || 0,
    carbonFootprint: material?.carbonFootprint || 0,
    sustainabilityScore: material?.sustainabilityScore || 0,
    recyclingProcess: material?.recyclingProcess || '',
    sustainableAlternatives: material?.sustainableAlternatives || '',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [systemCalculated, setSystemCalculated] = useState({
    recyclable: '',
    eprRate: 0,
    carbonFootprint: 0,
    sustainabilityScore: 0,
    recyclingProcess: '',
    sustainableAlternatives: ''
  });

  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSystemProperties = async () => {
    if (!formData.materialType || !formData.category) return;

    setIsCalculating(true);
    try {
      const calculations = await apiService.calculateMaterialProperties({
        materialType: formData.materialType,
        category: formData.category,
        pcrContent: formData.pcrContent || 0
      });

      setSystemCalculated(calculations);
      setFormData(prev => ({
        ...prev,
        recyclable: calculations.recyclable,
        eprRate: calculations.eprRate,
        carbonFootprint: calculations.carbonFootprint,
        sustainabilityScore: calculations.sustainabilityScore,
        recyclingProcess: calculations.recyclingProcess,
        sustainableAlternatives: calculations.sustainableAlternatives
      }));
    } catch (error) {
      console.error('Failed to calculate material properties:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate system properties. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (formData.materialType && formData.category) {
      calculateSystemProperties();
    }
  }, [formData.materialType, formData.category, formData.pcrContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = ValidationService.validateMaterial({
      name: formData.name,
      category: formData.category,
      materialType: formData.materialType,
      packagingComponentType: formData.packagingComponentType
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
    toast({
      title: material ? "Material Updated" : "Material Created",
      description: `${formData.name} has been ${material ? 'updated' : 'created'} successfully.`,
    });
  };

  const InfoIcon = ({ tooltip }: { tooltip: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
          <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        {tooltip}
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {material ? 'Edit Material' : 'Add New Material'}
            </h1>
            <p className="text-gray-600">Configure material properties and compliance settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Part A: User-Provided Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Part A: User-Provided Information</CardTitle>
              <CardDescription>The user fills this part out directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center">
                  <Label htmlFor="name">Material Name *</Label>
                  <InfoIcon tooltip={tooltips.materialName} />
                </div>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Clear Beverage Bottle Plastic"
                  required
                />
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="category">Category *</Label>
                  <InfoIcon tooltip={tooltips.category} />
                </div>
                <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plastic">Plastic</SelectItem>
                    <SelectItem value="Paper/Fiber">Paper/Fiber</SelectItem>
                    <SelectItem value="Glass">Glass</SelectItem>
                    <SelectItem value="Metal">Metal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="materialType">Material Type *</Label>
                  <InfoIcon tooltip={tooltips.materialType} />
                </div>
                <Select 
                  value={formData.materialType || ''} 
                  onValueChange={(value) => handleInputChange('materialType', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && materialTypeOptions[formData.category as keyof typeof materialTypeOptions]?.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="packagingComponentType">Packaging Component Type *</Label>
                  <InfoIcon tooltip={tooltips.packagingComponentType} />
                </div>
                <Select value={formData.packagingComponentType || ''} onValueChange={(value) => handleInputChange('packagingComponentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Container">Container</SelectItem>
                    <SelectItem value="Label">Label</SelectItem>
                    <SelectItem value="Closure">Closure</SelectItem>
                    <SelectItem value="Sleeve">Sleeve</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="description">Description</Label>
                  <InfoIcon tooltip={tooltips.description} />
                </div>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional user notes"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="pcrContent">Post-Consumer Recycled (PCR) Content % *</Label>
                  <InfoIcon tooltip={tooltips.pcrContent} />
                </div>
                <Input
                  id="pcrContent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.pcrContent || 0}
                  onChange={(e) => handleInputChange('pcrContent', parseFloat(e.target.value) || 0)}
                  placeholder="0-100"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Part B: System-Calculated Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Part B: System-Calculated Properties</CardTitle>
              <CardDescription>
                This part is read-only and is populated automatically by the system after you provide the info in Part A and save.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCalculating ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Calculating properties...</p>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center">
                      <Label>Recyclable?</Label>
                      <InfoIcon tooltip={tooltips.recyclable} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {systemCalculated.recyclable || 'Not calculated'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label>EPR Rate (per gram)</Label>
                      <InfoIcon tooltip={tooltips.eprRate} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      ${systemCalculated.eprRate.toFixed(4)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label>Carbon Footprint (kg CO₂/kg)</Label>
                      <InfoIcon tooltip={tooltips.carbonFootprint} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {systemCalculated.carbonFootprint.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label>Sustainability Score</Label>
                      <InfoIcon tooltip={tooltips.sustainabilityScore} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {systemCalculated.sustainabilityScore}/100
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label>Recycling Process</Label>
                      <InfoIcon tooltip={tooltips.recyclingProcess} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {systemCalculated.recyclingProcess || 'Not available'}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <Label>Sustainable Alternatives</Label>
                      <InfoIcon tooltip={tooltips.sustainableAlternatives} />
                    </div>
                    <div className="p-2 bg-gray-50 rounded border text-sm">
                      {systemCalculated.sustainableAlternatives || 'Not available'}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCalculating}>
            <Save className="h-4 w-4 mr-2" />
            {material ? 'Update Material' : 'Create Material'}
          </Button>
        </div>
      </form>
    </div>
  );
}
