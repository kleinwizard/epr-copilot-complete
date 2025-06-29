
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface Material {
  alternatives: string[];
}

interface AlternativesManagerProps {
  formData: Partial<Material>;
  onInputChange: (field: string, value: any) => void;
}

export function AlternativesManager({ formData, onInputChange }: AlternativesManagerProps) {
  const [newAlternative, setNewAlternative] = useState('');

  const addAlternative = () => {
    if (newAlternative.trim()) {
      onInputChange('alternatives', [...(formData.alternatives || []), newAlternative.trim()]);
      setNewAlternative('');
    }
  };

  const removeAlternative = (index: number) => {
    onInputChange('alternatives', formData.alternatives?.filter((_, i) => i !== index) || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sustainable Alternatives</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Alternative Materials</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newAlternative}
                onChange={(e) => setNewAlternative(e.target.value)}
                placeholder="Add alternative material"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlternative())}
              />
              <Button type="button" onClick={addAlternative} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.alternatives?.map((alternative, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{alternative}</span>
                  <button
                    type="button"
                    onClick={() => removeAlternative(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
