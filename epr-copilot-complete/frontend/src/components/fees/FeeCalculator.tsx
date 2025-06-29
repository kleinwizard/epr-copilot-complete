
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2, Info } from 'lucide-react';
import { calculateEprFee, oregonEprRates } from '@/services/feeCalculation';
import { FeeBreakdown } from './FeeBreakdown';

interface Material {
  type: string;
  weight: number;
  recyclable: boolean;
}

export function FeeCalculator() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState<Material>({
    type: '',
    weight: 0,
    recyclable: true
  });
  const [monthlyVolume, setMonthlyVolume] = useState(1);

  const addMaterial = () => {
    if (newMaterial.type && newMaterial.weight > 0) {
      setMaterials([...materials, { ...newMaterial }]);
      setNewMaterial({ type: '', weight: 0, recyclable: true });
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    setMaterials(materials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ));
  };

  const calculation = materials.length > 0 ? calculateEprFee(materials) : null;
  const monthlyFee = calculation ? calculation.totalFee * monthlyVolume : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>EPR Fee Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate Extended Producer Responsibility fees for your packaging materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Material Form */}
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3">Add Packaging Material</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select 
                  value={newMaterial.type} 
                  onValueChange={(value) => setNewMaterial(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(oregonEprRates).map(material => (
                      <SelectItem key={material} value={material}>
                        <div className="flex items-center justify-between w-full">
                          <span>{material}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            ${oregonEprRates[material as keyof typeof oregonEprRates]}/kg
                          </Badge>
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
                  <span className="text-sm">{newMaterial.recyclable ? 'Yes (25% discount)' : 'No'}</span>
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

          {/* Monthly Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Production Volume</Label>
              <Input
                type="number"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                min="1"
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                How many units of this product do you produce per month?
              </p>
            </div>
          </div>

          {/* Materials List */}
          <div className="space-y-3">
            <h4 className="font-medium">Added Materials</h4>
            {materials.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No materials added yet</p>
                <p className="text-sm">Add materials above to calculate EPR fees</p>
              </div>
            ) : (
              materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                        {material.weight}g • ${oregonEprRates[material.type as keyof typeof oregonEprRates] || 0.50}/kg
                      </div>
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
        </CardContent>
      </Card>

      {/* Fee Calculation Results */}
      {calculation && (
        <FeeBreakdown 
          calculation={calculation} 
          monthlyVolume={monthlyVolume}
          monthlyFee={monthlyFee}
        />
      )}

      {/* Info Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Oregon EPR Fee Information</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Fees are calculated per kilogram of packaging material</li>
                <li>• Recyclable materials receive a 25% discount</li>
                <li>• Rates are based on 2024 Oregon EPR regulations</li>
                <li>• Fees are collected quarterly and due 30 days after quarter end</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
