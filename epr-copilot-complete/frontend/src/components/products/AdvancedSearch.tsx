
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Save, History } from 'lucide-react';

interface SearchCriteria {
  query: string;
  category: string;
  status: string;
  weightMin: number;
  weightMax: number;
  feeMin: number;
  feeMax: number;
  recyclableOnly: boolean;
  lastUpdatedDays: number;
}

interface SavedSearch {
  id: string;
  name: string;
  criteria: SearchCriteria;
  createdAt: string;
}

interface AdvancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  onClear: () => void;
}

export function AdvancedSearch({ onSearch, onClear }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    query: '',
    category: 'all',
    status: 'all',
    weightMin: 0,
    weightMax: 1000,
    feeMin: 0,
    feeMax: 10,
    recyclableOnly: false,
    lastUpdatedDays: 365
  });
  
  const [savedSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'High Fee Products',
      criteria: { ...criteria, feeMin: 1 },
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Pending Review Items',
      criteria: { ...criteria, status: 'Pending Review' },
      createdAt: '2024-01-10'
    }
  ]);

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleClear = () => {
    const defaultCriteria: SearchCriteria = {
      query: '',
      category: 'all',
      status: 'all',
      weightMin: 0,
      weightMax: 1000,
      feeMin: 0,
      feeMax: 10,
      recyclableOnly: false,
      lastUpdatedDays: 365
    };
    setCriteria(defaultCriteria);
    onClear();
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setCriteria(search.criteria);
    onSearch(search.criteria);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Search className="h-4 w-4 mr-2" />
        Advanced Search
      </Button>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Advanced Search</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fuzzy Search */}
        <div className="space-y-2">
          <Label>Search Query</Label>
          <Input
            placeholder="Search products, SKUs, descriptions... (fuzzy matching)"
            value={criteria.query}
            onChange={(e) => setCriteria(prev => ({ ...prev, query: e.target.value }))}
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={criteria.category} onValueChange={(value) => setCriteria(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={criteria.status} onValueChange={(value) => setCriteria(prev => ({ ...prev, status: value }))}>
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

          <div className="space-y-2">
            <Label>Updated Within</Label>
            <Select 
              value={criteria.lastUpdatedDays.toString()} 
              onValueChange={(value) => setCriteria(prev => ({ ...prev, lastUpdatedDays: parseInt(value) }))}
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
        </div>

        {/* Saved Searches */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Saved Searches</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <Badge 
                key={search.id}
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => loadSavedSearch(search)}
              >
                {search.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <Button onClick={handleSearch}>
              Search Products
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
