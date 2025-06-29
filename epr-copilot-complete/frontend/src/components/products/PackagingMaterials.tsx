
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Recycle,
  Package2,
  AlertCircle
} from 'lucide-react';

interface Material {
  type: string;
  weight: number;
  recyclable: boolean;
}

interface PackagingMaterialsProps {
  materials: Material[];
  onChange: (materials: Material[]) => void;
}

const materialTypes = [
  { value: 'Glass', label: 'Glass', recyclable: true },
  { value: 'Metal (Steel)', label: 'Metal (Steel)', recyclable: true },
  { value: 'Metal (Aluminum)', label: 'Metal (Aluminum)', recyclable: true },
  { value: 'Paper (Label)', label: 'Paper (Label)', recyclable: true },
  { value: 'Paper (Corrugated)', label: 'Paper (Corrugated)', recyclable: true },
  { value: 'Cardboard', label: 'Cardboard', recyclable: true },
  { value: 'Plastic (PET)', label: 'Plastic (PET)', recyclable: true },
  { value: 'Plastic (HDPE)', label: 'Plastic (HDPE)', recyclable: true },
  { value: 'Plastic (LDPE)', label: 'Plastic (LDPE)', recyclable: false },
  { value: 'Plastic (PP)', label: 'Plastic (PP)', recyclable: true },
  { value: 'Plastic (PS)', label: 'Plastic (PS)', recyclable: false },
  { value: 'Plastic (Other)', label: 'Plastic (Other)', recyclable: false }
];

export function PackagingMaterials({ materials, onChange }: PackagingMaterialsProps) {
  const [newMaterial, setNewMaterial] = useState<Material>({
    type: '',
    weight: 0,
    recyclable: true
  });

  const addMaterial = () => {
    if (newMaterial.type && newMaterial.weight > 0) {
      onChange([...materials, { ...newMaterial }]);
      setNewMaterial({ type: '', weight: 0, recyclable: true });
    }
  };

  const removeMaterial = (index: number) => {
    const updated = materials.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    const updated = materials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    );
    onChange(updated);
  };

  const handleMaterialTypeChange = (type: string) => {
    const materialType = materialTypes.find(m => m.value === type);
    setNewMaterial(prev => ({
      ...prev,
      type,
      recyclable: materialType?.recyclable || false
    }));
  };

  const totalWeight = materials.reduce((sum, material) => sum + material.weight, 0);
  const recyclableWeight = materials.filter(m => m.recyclable).reduce((sum, material) => sum + material.weight, 0);
  const recyclabilityPercentage = totalWeight > 0 ? (recyclableWeight / totalWeight) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package2 className="w-5 h-5" />
          <span>Packaging Materials</span>
        </CardTitle>
        <CardDescription>
          Add all packaging components for accurate EPR fee calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Total Weight</p>
            <p className="text-xl font-bold text-blue-700">{totalWeight}g</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Recyclable</p>
            <p className="text-xl font-bold text-green-700">{recyclabilityPercentage.toFixed(0)}%</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900">Components</p>
            <p className="text-xl font-bold text-purple-700">{materials.length}</p>
          </div>
        </div>

        {/* Add New Material */}
        <div className="p-4 border border-dashed border-gray-300 rounded-lg">
          <h4 className="font-medium mb-3">Add Packaging Material</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Material Type</Label>
              <Select value={newMaterial.type} onValueChange={handleMaterialTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes.map(material => (
                    <SelectItem key={material.value} value={material.value}>
                      <div className="flex items-center space-x-2">
                        <span>{material.label}</span>
                        {material.recyclable && <Recycle className="h-3 w-3 text-green-600" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Weight (grams)</Label>
              <Input
                type="number"
                value={newMaterial.weight || ''}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, weight: Number(e.target.value) }))}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Recyclable</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={newMaterial.recyclable}
                  onCheckedChange={(checked) => setNewMaterial(prev => ({ ...prev, recyclable: checked }))}
                />
                <span className="text-sm">{newMaterial.recyclable ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                type="button" 
                onClick={addMaterial}
                disabled={!newMaterial.type || newMaterial.weight <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-3">
          {materials.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Package2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No packaging materials added yet</p>
              <p className="text-sm">Add materials above to calculate EPR fees</p>
            </div>
          ) : (
            materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{material.type}</span>
                      {material.recyclable && <Recycle className="h-3 w-3 text-green-600" />}
                      {!material.recyclable && <AlertCircle className="h-3 w-3 text-orange-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{material.weight}g</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={material.weight}
                    onChange={(e) => updateMaterial(index, 'weight', Number(e.target.value))}
                    className="w-20"
                    min="0"
                    step="0.1"
                  />
                  <Switch
                    checked={material.recyclable}
                    onCheckedChange={(checked) => updateMaterial(index, 'recyclable', checked)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeMaterial(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {materials.length > 0 && recyclabilityPercentage < 70 && (
          <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900">Low Recyclability Warning</p>
              <p className="text-orange-700">
                Only {recyclabilityPercentage.toFixed(0)}% of packaging materials are recyclable. 
                Consider using more sustainable packaging options to reduce EPR fees.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
