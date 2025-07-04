
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Upload, Download } from 'lucide-react';

interface ProductControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onAddProduct: () => void;
  onImportCSV?: () => void;
  onExportProducts?: () => void;
}

export function ProductControls({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  onAddProduct,
  onImportCSV,
  onExportProducts
}: ProductControlsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Food &amp; Beverage">Food &amp; Beverage</SelectItem>
            <SelectItem value="Personal Care">Personal Care</SelectItem>
            <SelectItem value="Electronics">Electronics</SelectItem>
            <SelectItem value="Household">Household</SelectItem>
            <SelectItem value="Automotive">Automotive</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending Review">Pending Review</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Needs Update">Needs Update</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-2 ml-4">
        <Button variant="outline" size="sm" onClick={onImportCSV}>
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={onExportProducts}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    </div>
  );
}
