
import { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Package, 
  Recycle,
  AlertTriangle,
  Calculator,
  Info
} from 'lucide-react';
import { PackagingMaterials } from './PackagingMaterials';
import { ValidationService } from '@/services/validationService';
import { ValidationMessage } from '@/components/common/ValidationMessage';

interface Material {
  type: string;
  weight: number;
  recyclable: boolean;
  packagingLevel: 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'ECOM_SHIPPER' | 'SERVICE_WARE';
  isBeverageContainer: boolean;
  isMedicalExempt: boolean;
  isFifraExempt: boolean;
  caPlasticComponentFlag: boolean;
  meToxicityFlag: boolean;
  orLcaBonusTier?: 'A' | 'B' | 'C';
}

interface Product {
  id?: number;
  name: string;
  sku: string;
  category: string;
  weight: number;
  materials: Material[];
  status: string;
  description?: string;
  upc?: string;
  manufacturer?: string;
  lastUpdated: string;
  eprFee: number;
  designatedProducerId?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    weight: product?.weight || 0,
    materials: product?.materials || [],
    status: product?.status || 'Active',
    description: product?.description || '',
    upc: product?.upc || '',
    manufacturer: product?.manufacturer || '',
    lastUpdated: new Date().toISOString().split('T')[0],
    eprFee: product?.eprFee || 0,
    designatedProducerId: product?.designatedProducerId || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [designatedProducers, setDesignatedProducers] = useState([
    { id: 'default', name: 'Use Default (Brand Owner)' },
    { id: 'org1', name: 'Alternative Producer 1' },
    { id: 'org2', name: 'Alternative Producer 2' },
    { id: 'org3', name: 'Alternative Producer 3' }
  ]);

  const categories = [
    "Food & Beverage",
    "Personal Care", 
    "Electronics",
    "Household",
    "Automotive",
    "Apparel",
    "Health & Wellness"
  ];

  const validateForm = () => {
    const validation = ValidationService.validateProduct(formData);
    
    if (formData.materials.length === 0) {
      validation.fieldErrors.materials = 'At least one packaging material is required';
      validation.errors.push('At least one packaging material is required');
      validation.isValid = false;
    }
    
    setErrors(validation.fieldErrors);
    return validation.isValid;
  };

  const calculateEprFee = useCallback(() => {
    // Simple EPR fee calculation based on Oregon rates
    const feeRates = {
      'Glass': 0.001,
      'Metal (Steel)': 0.002,
      'Metal (Aluminum)': 0.003,
      'Paper (Label)': 0.0005,
      'Paper (Corrugated)': 0.0008,
      'Cardboard': 0.001,
      'Plastic (PET)': 0.004,
      'Plastic (HDPE)': 0.0035,
      'Plastic (LDPE)': 0.006,
      'Plastic (PP)': 0.0045,
      'Plastic (PS)': 0.008,
      'Plastic (Other)': 0.01
    };

    const totalFee = formData.materials.reduce((sum, material) => {
      const rate = feeRates[material.type] || 0.005;
      return sum + (material.weight * rate);
    }, 0);

    setFormData(prev => ({ ...prev, eprFee: totalFee }));
  }, [formData.materials]);

  const debouncedCalculateEprFee = useMemo(
    () => debounce(calculateEprFee, 300),
    [calculateEprFee]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleMaterialsChange = (materials: Material[]) => {
    setFormData(prev => ({ ...prev, materials }));
    // Recalculate total weight
    const totalWeight = materials.reduce((sum, material) => sum + material.weight, 0);
    setFormData(prev => ({ ...prev, weight: totalWeight }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-muted-foreground">
            {product ? 'Update product information and packaging materials' : 'Enter product details and packaging materials for EPR compliance'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="materials">Packaging Materials</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                    {errors.name && <ValidationMessage type="error" message={errors.name} className="mt-1" />}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Enter SKU"
                    />
                    {errors.sku && <ValidationMessage type="error" message={errors.sku} className="mt-1" />}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <ValidationMessage type="error" message={errors.category} className="mt-1" />}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending Review">Pending Review</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Needs Update">Needs Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="upc">UPC/Barcode</Label>
                    <Input
                      id="upc"
                      value={formData.upc}
                      onChange={(e) => setFormData(prev => ({ ...prev, upc: e.target.value }))}
                      placeholder="Enter UPC or barcode"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                      placeholder="Enter manufacturer"
                    />
                  </div>
                </div>
                
                <div className="space-y-2" data-tutorial="designated-producer">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="designatedProducer">Designated Producer</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Designated Producer</h4>
                          <p className="text-sm text-muted-foreground">
                            A 'Designated Producer' is the legal entity responsible for reporting and paying EPR fees for a specific product in a given jurisdiction. This is typically the brand owner. For imported goods, it may be the first importer. Assigning a producer is crucial for accurate reporting, especially if your account manages multiple business entities.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Select value={formData.designatedProducerId || 'default'} onValueChange={(value) => setFormData(prev => ({ ...prev, designatedProducerId: value === 'default' ? undefined : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Use Default (Brand Owner)" />
                    </SelectTrigger>
                    <SelectContent>
                      {designatedProducers.map(producer => (
                        <SelectItem key={producer.id} value={producer.id}>
                          {producer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Override the default brand owner responsibility for California EPR compliance
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Product Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the product..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <PackagingMaterials
              materials={formData.materials}
              onChange={handleMaterialsChange}
            />
            {errors.materials && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{errors.materials}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>EPR Compliance Summary</span>
                </CardTitle>
                <CardDescription>
                  Review calculated fees and compliance information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Total Package Weight</p>
                    <p className="text-2xl font-bold text-blue-700">{formData.weight}g</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Recyclable Materials</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formData.materials.filter(m => m.recyclable).length}/{formData.materials.length}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Estimated EPR Fee</p>
                    <p className="text-2xl font-bold text-purple-700">${formData.eprFee.toFixed(2)}</p>
                  </div>
                </div>

                <Button type="button" onClick={calculateEprFee} variant="outline" className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate EPR Fee
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium">Material Breakdown:</h4>
                  <div className="space-y-2">
                    {formData.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{material.type}</span>
                          {material.recyclable && <Recycle className="h-3 w-3 text-green-600" />}
                        </div>
                        <span className="text-sm">{material.weight}g</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {product ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
