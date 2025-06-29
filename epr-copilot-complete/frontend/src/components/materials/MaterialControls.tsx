
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Upload, Download } from 'lucide-react';

interface MaterialControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCompliance: string;
  setSelectedCompliance: (compliance: string) => void;
  onAddMaterial: () => void;
}

export function MaterialControls({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCompliance,
  setSelectedCompliance,
  onAddMaterial
}: MaterialControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search materials by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Glass">Glass</SelectItem>
          <SelectItem value="Plastic">Plastic</SelectItem>
          <SelectItem value="Metal">Metal</SelectItem>
          <SelectItem value="Paper">Paper</SelectItem>
          <SelectItem value="Composite">Composite</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={selectedCompliance} onValueChange={setSelectedCompliance}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Compliant">Compliant</SelectItem>
          <SelectItem value="Restricted">Restricted</SelectItem>
          <SelectItem value="Banned">Banned</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
