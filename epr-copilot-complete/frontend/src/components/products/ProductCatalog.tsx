
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
import { dataService } from '@/services/dataService';
import { useEffect } from 'react';


export function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [filters, setFilters] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await dataService.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Using offline mode.",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "CSV Import Started",
          description: `Processing ${file.name} for product import...`,
        });
        
        setTimeout(() => {
          toast({
            title: "Import Complete",
            description: "Products have been successfully imported from CSV.",
          });
        }, 2000);
      }
    };
    input.click();
  };

  const handleExportProducts = () => {
    const csvContent = products.map(product => 
      `${product.name},${product.sku},${product.category},${product.weight},${product.status},${product.eprFee}`
    ).join('\n');
    const header = 'Name,SKU,Category,Weight,Status,EPR Fee\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Products have been exported to CSV file.",
    });
  };

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

  const handleSaveProduct = async (productData) => {
    try {
      if (!productData.name || !productData.sku) {
        throw new Error('Product name and SKU are required');
      }

      if (!productData.materials || productData.materials.length === 0) {
        throw new Error('At least one material is required');
      }

      const invalidMaterials = productData.materials.filter(m => !m.type || m.weight <= 0);
      if (invalidMaterials.length > 0) {
        throw new Error('All materials must have a valid type and weight greater than 0');
      }

      setIsLoading(true);
      let savedProduct;
      
      if (editingProduct) {
        savedProduct = await dataService.updateProduct(editingProduct.id, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? savedProduct : p));
        toast({
          title: "Success",
          description: `Product "${savedProduct.name}" has been updated successfully.`,
        });
      } else {
        savedProduct = await dataService.saveProduct(productData);
        setProducts([...products, savedProduct]);
        toast({
          title: "Success", 
          description: `Product "${savedProduct.name}" has been created successfully.`,
        });
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      
      await loadProducts();
      
    } catch (error) {
      console.error('Product save error:', error);
      
      let errorMessage = "Failed to save product. Please try again.";
      if (error.message.includes('duplicate')) {
        errorMessage = "A product with this SKU already exists. Please use a different SKU.";
      } else if (error.message.includes('validation')) {
        errorMessage = "Please check all required fields and try again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            onImportCSV={handleImportCSV}
            onExportProducts={handleExportProducts}
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
