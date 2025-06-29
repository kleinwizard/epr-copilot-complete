
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Material {
  eprRate: number;
  carbonFootprint: number;
  densityRange: { min: number; max: number };
  sustainabilityScore: number;
}

interface TechnicalPropertiesProps {
  formData: Partial<Material>;
  onInputChange: (field: string, value: any) => void;
  onDensityChange: (type: 'min' | 'max', value: number) => void;
}

export function TechnicalProperties({ formData, onInputChange, onDensityChange }: TechnicalPropertiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>EPR Rate (per gram)</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.eprRate || 0}
            onChange={(e) => onInputChange('eprRate', parseFloat(e.target.value))}
            placeholder="0.0012"
          />
        </div>
        
        <div>
          <Label>Carbon Footprint (kg CO₂/kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={formData.carbonFootprint || 0}
            onChange={(e) => onInputChange('carbonFootprint', parseFloat(e.target.value))}
            placeholder="1.5"
          />
        </div>
        
        <div>
          <Label>Density Range (g/cm³)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.densityRange?.min || 0}
                onChange={(e) => onDensityChange('min', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Max</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.densityRange?.max || 1}
                onChange={(e) => onDensityChange('max', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label>Sustainability Score: {formData.sustainabilityScore || 50}</Label>
          <Slider
            value={[formData.sustainabilityScore || 50]}
            onValueChange={(value) => onInputChange('sustainabilityScore', value[0])}
            max={100}
            step={1}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
