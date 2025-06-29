
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Plus } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  weight: number;
  materials: Array<{
    type: string;
    weight: number;
    recyclable: boolean;
  }>;
  status: string;
  lastUpdated: string;
  eprFee: number;
}

interface ProductGridProps {
  filteredProducts: Product[];
  selectedProducts: number[];
  onSelectProduct: (productId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddProduct: () => void;
}

export function ProductGrid({
  filteredProducts,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onAddProduct
}: ProductGridProps) {
  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search or filters, or add a new product.</p>
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Product
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Selection Controls */}
      <div className="flex items-center space-x-4 mb-4 p-2 bg-gray-50 rounded">
        <Checkbox
          checked={selectedProducts.length === filteredProducts.length}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
        />
        <span className="text-sm text-gray-600">
          {selectedProducts.length > 0 ? `${selectedProducts.length} selected` : 'Select all'}
        </span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative">
            <Checkbox
              className="absolute top-2 left-2 z-10"
              checked={selectedProducts.includes(product.id)}
              onCheckedChange={(checked) => onSelectProduct(product.id, !!checked)}
            />
            <ProductCard
              product={product}
              onEdit={() => console.log('Edit product', product.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
