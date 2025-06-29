
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Copy, 
  Star, 
  Package,
  Recycle,
  DollarSign,
  Share
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  materials: Array<{
    type: string;
    weight: number;
    recyclable: boolean;
  }>;
  estimatedFee: number;
  isIndustryTemplate: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

interface ProductTemplatesProps {
  onUseTemplate: (template: ProductTemplate) => void;
}

const mockTemplates: ProductTemplate[] = [
  {
    id: '1',
    name: 'Glass Sauce Jar',
    description: 'Standard glass sauce jar with metal lid and paper label',
    category: 'Food & Beverage',
    materials: [
      { type: 'Glass', weight: 450, recyclable: true },
      { type: 'Metal (Steel)', weight: 30, recyclable: true },
      { type: 'Paper (Label)', weight: 15, recyclable: true }
    ],
    estimatedFee: 0.24,
    isIndustryTemplate: true,
    isFavorite: false,
    usageCount: 127,
    createdBy: 'System',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Plastic Shampoo Bottle',
    description: 'HDPE bottle with PP pump and paper label',
    category: 'Personal Care',
    materials: [
      { type: 'Plastic (HDPE)', weight: 35, recyclable: true },
      { type: 'Plastic (PP)', weight: 8, recyclable: true },
      { type: 'Paper (Label)', weight: 12, recyclable: true }
    ],
    estimatedFee: 0.18,
    isIndustryTemplate: true,
    isFavorite: true,
    usageCount: 89,
    createdBy: 'System',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Cereal Box',
    description: 'Cardboard box with plastic liner',
    category: 'Food & Beverage',
    materials: [
      { type: 'Cardboard', weight: 85, recyclable: true },
      { type: 'Plastic (LDPE)', weight: 25, recyclable: false }
    ],
    estimatedFee: 0.32,
    isIndustryTemplate: false,
    isFavorite: false,
    usageCount: 45,
    createdBy: 'John Doe',
    createdAt: '2024-01-15'
  }
];

export function ProductTemplates({ onUseTemplate }: ProductTemplatesProps) {
  const [templates, setTemplates] = useState<ProductTemplate[]>(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '',
    isShared: false
  });
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleUseTemplate = (template: ProductTemplate) => {
    onUseTemplate(template);
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    toast({
      title: "Template Applied",
      description: `Created new product from ${template.name} template`,
    });
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const createTemplate = () => {
    const template: ProductTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      materials: [],
      estimatedFee: 0,
      isIndustryTemplate: false,
      isFavorite: false,
      usageCount: 0,
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates(prev => [...prev, template]);
    setShowCreateDialog(false);
    setNewTemplate({ name: '', description: '', category: '', isShared: false });
    toast({
      title: "Template Created",
      description: `${template.name} template has been created`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Product Templates</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Household">Household</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{template.name}</span>
                        {template.isIndustryTemplate && (
                          <Badge variant="secondary" className="text-xs">Industry</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(template.id)}
                    >
                      <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Copy className="h-3 w-3" />
                      <span>{template.usageCount} uses</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Package className="h-3 w-3 text-blue-600" />
                      <span>{template.materials.length} materials</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Recycle className="h-3 w-3 text-green-600" />
                      <span>{template.materials.filter(m => m.recyclable).length} recyclable</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3 text-purple-600" />
                      <span>${template.estimatedFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium">Materials:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.materials.slice(0, 3).map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {material.type}
                        </Badge>
                      ))}
                      {template.materials.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.materials.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="Enter template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this template..."
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Personal Care">Personal Care</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Household">Household</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate} disabled={!newTemplate.name || !newTemplate.category}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
