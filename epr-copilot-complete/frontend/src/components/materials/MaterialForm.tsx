
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BasicInformation } from './form/BasicInformation';
import { TechnicalProperties } from './form/TechnicalProperties';
import { RecyclingInformation } from './form/RecyclingInformation';
import { AlternativesManager } from './form/AlternativesManager';

interface Material {
  id?: number;
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

interface MaterialFormProps {
  material?: Material | null;
  onSave: (material: Partial<Material>) => void;
  onCancel: () => void;
}

export function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Material>>({
    name: material?.name || '',
    category: material?.category || '',
    type: material?.type || '',
    recyclable: material?.recyclable || false,
    eprRate: material?.eprRate || 0,
    densityRange: material?.densityRange || { min: 0, max: 1 },
    sustainabilityScore: material?.sustainabilityScore || 50,
    alternatives: material?.alternatives || [],
    complianceStatus: material?.complianceStatus || 'Compliant',
    description: material?.description || '',
    carbonFootprint: material?.carbonFootprint || 0,
    recyclingProcess: material?.recyclingProcess || '',
    endOfLife: material?.endOfLife || [],
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDensityChange = (type: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      densityRange: {
        ...prev.densityRange!,
        [type]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <BasicInformation formData={formData} onInputChange={handleInputChange} />

          {/* Technical Properties */}
          <TechnicalProperties 
            formData={formData} 
            onInputChange={handleInputChange} 
            onDensityChange={handleDensityChange}
          />
        </div>

        {/* Additional Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Recycling Information */}
          <RecyclingInformation formData={formData} onInputChange={handleInputChange} />

          {/* Alternatives */}
          <AlternativesManager formData={formData} onInputChange={handleInputChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {material ? 'Update Material' : 'Create Material'}
          </Button>
        </div>
      </form>
    </div>
  );
}
