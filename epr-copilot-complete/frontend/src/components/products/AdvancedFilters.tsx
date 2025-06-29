
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  onClearFilters: () => void;
}

export interface ProductFilters {
  category: string;
  status: string;
  weightRange: [number, number];
  feeRange: [number, number];
  recyclableOnly: boolean;
  lastUpdatedDays: number;
  materialType: string;
}

export function AdvancedFilters({ onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    category: 'all',
    status: 'all',
    weightRange: [0, 1000],
    feeRange: [0, 5],
    recyclableOnly: false,
    lastUpdatedDays: 365,
    materialType: 'all'
  });

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters: ProductFilters = {
      category: 'all',
      status: 'all',
      weightRange: [0, 1000],
      feeRange: [0, 5],
      recyclableOnly: false,
      lastUpdatedDays: 365,
      materialType: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    onClearFilters();
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Filter className="h-4 w-4 mr-2" />
        Advanced Filters
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Household">Household</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Material Type Filter */}
          <div className="space-y-2">
            <Label>Primary Material</Label>
            <Select value={filters.materialType} onValueChange={(value) => updateFilters({ materialType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                <SelectItem value="Plastic">Plastic</SelectItem>
                <SelectItem value="Glass">Glass</SelectItem>
                <SelectItem value="Paper">Paper</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weight Range */}
          <div className="space-y-3">
            <Label>Weight Range (grams)</Label>
            <Slider
              value={filters.weightRange}
              onValueChange={(value) => updateFilters({ weightRange: value as [number, number] })}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{filters.weightRange[0]}g</span>
              <span>{filters.weightRange[1]}g</span>
            </div>
          </div>

          {/* Fee Range */}
          <div className="space-y-3">
            <Label>EPR Fee Range ($)</Label>
            <Slider
              value={filters.feeRange}
              onValueChange={(value) => updateFilters({ feeRange: value as [number, number] })}
              max={5}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>${filters.feeRange[0].toFixed(2)}</span>
              <span>${filters.feeRange[1].toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={filters.recyclableOnly}
              onCheckedChange={(checked) => updateFilters({ recyclableOnly: checked })}
            />
            <Label>Show only recyclable products</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Updated within (days)</Label>
          <Select 
            value={filters.lastUpdatedDays.toString()} 
            onValueChange={(value) => updateFilters({ lastUpdatedDays: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
