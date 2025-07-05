
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, X, Save, History, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';

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
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      const searches = await dataService.getSavedSearches();
      setSavedSearches(searches || []);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

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
    toast({
      title: "Search Loaded",
      description: `Applied saved search: ${search.name}`,
    });
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your saved search.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const savedSearch = await dataService.saveSearch({
        name: searchName.trim(),
        criteria: criteria
      });
      
      setSavedSearches([...savedSearches, savedSearch]);
      setIsSaveDialogOpen(false);
      setSearchName('');
      
      toast({
        title: "Search Saved",
        description: `Search "${searchName}" has been saved successfully.`,
      });
    } catch (error) {
      console.error('Failed to save search:', error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    try {
      await dataService.deleteSavedSearch(searchId);
      setSavedSearches(savedSearches.filter(s => s.id !== searchId));
      
      toast({
        title: "Search Deleted",
        description: "Saved search has been deleted successfully.",
      });
    } catch (error) {
      console.error('Failed to delete search:', error);
      toast({
        title: "Error",
        description: "Failed to delete search. Please try again.",
        variant: "destructive",
      });
    }
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
            {savedSearches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved searches yet. Save your first search below.</p>
            ) : (
              savedSearches.map((search) => (
                <div key={search.id} className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => loadSavedSearch(search)}
                  >
                    {search.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-50"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                  <DialogDescription>
                    Give your search a name so you can easily find and reuse it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-name">Search Name</Label>
                    <Input
                      id="search-name"
                      placeholder="e.g., High Fee Products, Pending Review Items"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveSearch();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSearch} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Search'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
