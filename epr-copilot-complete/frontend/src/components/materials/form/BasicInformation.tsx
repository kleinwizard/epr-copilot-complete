
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Material {
  name: string;
  category: string;
  type: string;
  description: string;
  recyclable: boolean;
  complianceStatus: 'Compliant' | 'Restricted' | 'Banned';
}

interface BasicInformationProps {
  formData: Partial<Material>;
  onInputChange: (field: string, value: any) => void;
}

export function BasicInformation({ formData, onInputChange }: BasicInformationProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Core material properties and identification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Material Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="e.g., PET Plastic"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category || ''} onValueChange={(value) => onInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Glass">Glass</SelectItem>
                <SelectItem value="Plastic">Plastic</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
                <SelectItem value="Paper">Paper</SelectItem>
                <SelectItem value="Composite">Composite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type || ''} onValueChange={(value) => onInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Container">Container</SelectItem>
                <SelectItem value="Flexible Packaging">Flexible Packaging</SelectItem>
                <SelectItem value="Rigid Packaging">Rigid Packaging</SelectItem>
                <SelectItem value="Label">Label</SelectItem>
                <SelectItem value="Closure">Closure</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="compliance">Compliance Status</Label>
            <Select 
              value={formData.complianceStatus || 'Compliant'} 
              onValueChange={(value) => onInputChange('complianceStatus', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compliant">Compliant</SelectItem>
                <SelectItem value="Restricted">Restricted</SelectItem>
                <SelectItem value="Banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Detailed description of the material..."
            rows={3}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recyclable"
            checked={formData.recyclable || false}
            onCheckedChange={(checked) => onInputChange('recyclable', !!checked)}
          />
          <Label htmlFor="recyclable">This material is recyclable</Label>
        </div>
      </CardContent>
    </Card>
  );
}
