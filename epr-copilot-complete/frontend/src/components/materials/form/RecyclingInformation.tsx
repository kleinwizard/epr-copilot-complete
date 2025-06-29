
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface Material {
  recyclingProcess: string;
  endOfLife: string[];
}

interface RecyclingInformationProps {
  formData: Partial<Material>;
  onInputChange: (field: string, value: any) => void;
}

export function RecyclingInformation({ formData, onInputChange }: RecyclingInformationProps) {
  const [newEndOfLife, setNewEndOfLife] = useState('');

  const addEndOfLife = () => {
    if (newEndOfLife.trim()) {
      onInputChange('endOfLife', [...(formData.endOfLife || []), newEndOfLife.trim()]);
      setNewEndOfLife('');
    }
  };

  const removeEndOfLife = (index: number) => {
    onInputChange('endOfLife', formData.endOfLife?.filter((_, i) => i !== index) || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recycling Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recyclingProcess">Recycling Process</Label>
          <Textarea
            id="recyclingProcess"
            value={formData.recyclingProcess || ''}
            onChange={(e) => onInputChange('recyclingProcess', e.target.value)}
            placeholder="Describe the recycling process..."
            rows={3}
          />
        </div>
        
        <div>
          <Label>End-of-Life Options</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={newEndOfLife}
                onChange={(e) => setNewEndOfLife(e.target.value)}
                placeholder="Add end-of-life option"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEndOfLife())}
              />
              <Button type="button" onClick={addEndOfLife} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.endOfLife?.map((option, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => removeEndOfLife(index)}
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
