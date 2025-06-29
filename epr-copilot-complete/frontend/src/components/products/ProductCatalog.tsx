
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from './ProductForm';
import { EnhancedBulkOperations } from './EnhancedBulkOperations';
import { AdvancedSearch } from './AdvancedSearch';
import { ProductStats } from './ProductStats';
import { ProductControls } from './ProductControls';
import { ProductGrid } from './ProductGrid';
import { VersionControl } from './VersionControl';
import { MaterialSubstitution } from './MaterialSubstitution';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: "Organic Pasta Sauce",
    sku: "OPS-001",
    category: "Food & Beverage",
    weight: 680,
    materials: [
      { type: "Glass", weight: 450, recyclable: true },
      { type: "Metal (Steel)", weight: 30, recyclable: true },
      { type: "Paper (Label)", weight: 15, recyclable: true }
    ],
    status: "Active",
    lastUpdated: "2024-01-15",
    eprFee: 0.24
  },
  {
    id: 2,
    name: "Premium Shampoo",
    sku: "PS-200",
    category: "Personal Care",
    weight: 400,
    materials: [
      { type: "Plastic (HDPE)", weight: 35, recyclable: true },
      { type: "Plastic (PP)", weight: 8, recyclable: true },
      { type: "Paper (Label)", weight: 12, recyclable: true }
    ],
    status: "Active",
    lastUpdated: "2024-01-20",
    eprFee: 0.18
  },
  {
    id: 3,
    name: "Breakfast Cereal",
    sku: "BC-300",
    category: "Food & Beverage",
    weight: 500,
    materials: [
      { type: "Cardboard", weight: 85, recyclable: true },
      { type: "Plastic (LDPE)", weight: 25, recyclable: false }
    ],
    status: "Pending Review",
    lastUpdated: "2024-01-22",
    eprFee: 0.32
  }
];

export function ProductCatalog() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [filters, setFilters] = useState<any | null>(null);
  const { toast } = useToast();

  // Enhanced search functionality
  const applyAdvancedSearch = (criteria: any) => {
    return (product: any) => {
      // Fuzzy search implementation
      const searchTerms = criteria.query.toLowerCase().split(' ');
      const searchableText = [product.name, product.sku, product.description || ''].join(' ').toLowerCase();
      const matchesSearch = criteria.query === '' || searchTerms.every(term => searchableText.includes(term));
      
      // Apply other criteria
      const matchesCategory = criteria.category === 'all' || product.category === criteria.category;
      const matchesStatus = criteria.status === 'all' || product.status === criteria.status;
      const withinWeightRange = product.weight >= criteria.weightMin && product.weight <= criteria.weightMax;
      const withinFeeRange = product.eprFee >= criteria.feeMin && product.eprFee <= criteria.feeMax;
      const recyclableMatch = !criteria.recyclableOnly || product.materials.every((m: any) => m.recyclable);
      
      const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(product.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
      const withinTimeframe = daysSinceUpdate <= criteria.lastUpdatedDays;
      
      return matchesSearch && matchesCategory && matchesStatus && withinWeightRange && 
             withinFeeRange && recyclableMatch && withinTimeframe;
    };
  };

  const applyFilters = (product: any): boolean => {
    if (!filters) return true;
    const filterFunction = applyAdvancedSearch(filters);
    return filterFunction(product);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    const matchesAdvancedFilters = applyFilters(product);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAdvancedFilters;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "Active").length;
  const pendingReview = products.filter(p => p.status === "Pending Review").length;
  const totalEprFees = products.reduce((sum, product) => sum + product.eprFee, 0);

  const handleAdvancedSearch = (criteria: any) => {
    setFilters(criteria);
    toast({
      title: "Search Applied",
      description: "Advanced search criteria have been applied",
    });
  };

  const handleClearAdvancedSearch = () => {
    setFilters(null);
    toast({
      title: "Search Cleared",
      description: "All search criteria have been cleared",
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p));
    } else {
      setProducts([...products, { ...productData, id: Date.now() }]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Enhanced bulk operations
  const handleEnhancedBulkAction = (action: string, data?: any) => {
    switch (action) {
      case 'delete':
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        toast({
          title: "Products Deleted",
          description: `${selectedProducts.length} products have been deleted.`,
        });
        break;
      case 'updateStatus':
        setProducts(products.map(p => 
          selectedProducts.includes(p.id) ? { ...p, status: data } : p
        ));
        toast({
          title: "Status Updated",
          description: `${selectedProducts.length} products status updated to ${data}.`,
        });
        break;
      case 'bulkEdit':
        setProducts(products.map(p => {
          if (!selectedProducts.includes(p.id)) return p;
          const updates: any = {};
          if (data.status) updates.status = data.status;
          if (data.category) updates.category = data.category;
          if (data.notes) updates.notes = data.notes;
          return { ...p, ...updates };
        }));
        toast({
          title: "Bulk Edit Complete",
          description: `${selectedProducts.length} products have been updated.`,
        });
        break;
      case 'duplicate':
        const duplicates = products
          .filter(p => selectedProducts.includes(p.id))
          .map(p => ({ 
            ...p, 
            id: Date.now() + Math.random(), 
            name: `${p.name} (Copy)`,
            sku: `${p.sku}-COPY`
          }));
        setProducts([...products, ...duplicates]);
        toast({
          title: "Products Duplicated",
          description: `${selectedProducts.length} products have been duplicated.`,
        });
        break;
      case 'export':
        // Enhanced export logic
        const exportData = products.filter(p => selectedProducts.includes(p.id));
        console.log('Exporting enhanced data:', exportData);
        toast({
          title: "Export Started",
          description: `Exporting ${selectedProducts.length} products with enhanced data.`,
        });
        break;
    }
    setSelectedProducts([]);
  };

  const handleUseTemplate = (template: any) => {
    const newProduct = {
      id: Date.now(),
      name: template.name,
      sku: `TEMP-${Date.now()}`,
      category: template.category,
      weight: template.materials.reduce((sum: number, m: any) => sum + m.weight, 0),
      materials: template.materials,
      status: "Draft",
      lastUpdated: new Date().toISOString().split('T')[0],
      eprFee: template.estimatedFee
    };
    setProducts([...products, newProduct]);
    toast({
      title: "Template Applied",
      description: `Created new product from ${template.name} template`,
    });
  };

  const handleVersionRevert = (productId: number, version: any) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, ...version.data, lastUpdated: new Date().toISOString().split('T')[0] } : p
    ));
    toast({
      title: "Version Reverted",
      description: `Product reverted to version ${version.version}`,
    });
  };

  const handleMaterialSubstitution = (productId: number, materialIndex: number, alternative: any) => {
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      const newMaterials = [...p.materials];
      newMaterials[materialIndex] = {
        type: alternative.name,
        weight: newMaterials[materialIndex].weight,
        recyclable: alternative.recyclable
      };
      const newEprFee = newMaterials.reduce((sum, m) => sum + (m.weight * (alternative.eprRate || 0.005)), 0);
      return { ...p, materials: newMaterials, eprFee: newEprFee };
    }));
    toast({
      title: "Material Substituted",
      description: `Material substituted with ${alternative.name}`,
    });
  };

  if (showProductForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={() => setShowProductForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProductStats
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        pendingReview={pendingReview}
        totalEprFees={totalEprFees}
      />

      <EnhancedBulkOperations
        selectedProducts={selectedProducts}
        onClearSelection={() => setSelectedProducts([])}
        onBulkAction={handleEnhancedBulkAction}
      />

      <AdvancedSearch
        onSearch={handleAdvancedSearch}
        onClear={handleClearAdvancedSearch}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Advanced product management with version control and material substitution</CardDescription>
            </div>
            <div className="flex space-x-2">
              <VersionControl
                productId={0}
                currentVersion={{}}
                onRevert={(version) => handleVersionRevert(0, version)}
              />
              <MaterialSubstitution
                currentMaterial={{ type: 'Plastic (PET)', weight: 100, recyclable: true, eprRate: 0.004 }}
                onSelectAlternative={(alt) => handleMaterialSubstitution(0, 0, alt)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            onAddProduct={handleAddProduct}
            onUseTemplate={handleUseTemplate}
          />

          <ProductGrid
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={handleSelectAll}
            onAddProduct={handleAddProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
}
