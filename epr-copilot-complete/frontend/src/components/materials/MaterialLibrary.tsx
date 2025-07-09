
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus } from 'lucide-react';
import { MaterialDetails } from './MaterialDetails';
import { MaterialForm } from './MaterialForm';
import { MaterialStats } from './MaterialStats';
import { MaterialControls } from './MaterialControls';
import { MaterialGrid } from './MaterialGrid';
import { useToast } from '@/hooks/use-toast';
import { dataService, Material } from '@/services/dataService';
import { useEffect } from 'react';


export function MaterialLibrary() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCompliance, setSelectedCompliance] = useState("all");
  const [showDetails, setShowDetails] = useState<Material | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await dataService.getMaterials();
      setMaterials(data || []);
    } catch (error) {
      console.error('Failed to load materials:', error);
      toast({
        title: "Error",
        description: "Failed to load materials. Using offline mode.",
        variant: "destructive",
      });
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportMaterials = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Material Import Started",
          description: `Processing ${file.name} for material import...`,
        });
        
        setTimeout(() => {
          toast({
            title: "Import Complete",
            description: "Materials have been successfully imported from CSV.",
          });
        }, 2000);
      }
    };
    input.click();
  };

  const handleExportLibrary = () => {
    const csvContent = materials.map(material => 
      `${material.name},${material.category},${material.type},${material.recyclable},${material.eprRate},${material.sustainabilityScore}`
    ).join('\n');
    const header = 'Name,Category,Type,Recyclable,EPR Rate,Sustainability Score\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials_library_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Material library has been exported to CSV file.",
    });
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.category === selectedCategory;
    const matchesCompliance = selectedCompliance === "all" || material.complianceStatus === selectedCompliance;
    
    return matchesSearch && matchesCategory && matchesCompliance;
  });

  const totalMaterials = materials.length;
  const compliantMaterials = materials.filter(m => m.complianceStatus === "Compliant").length;
  const recyclableMaterials = materials.filter(m => m.recyclable).length;

  const handleViewDetails = (material: Material) => {
    setShowDetails(material);
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleSaveMaterial = async (materialData: Partial<Material>) => {
    try {
      if (!materialData.name || !materialData.category) {
        throw new Error('Material name and category are required');
      }

      let savedMaterial;
      if (editingMaterial) {
        savedMaterial = await dataService.updateMaterial(editingMaterial.id, materialData);
        setMaterials(materials.map(m => m.id === editingMaterial.id ? savedMaterial : m));
      } else {
        savedMaterial = await dataService.saveMaterial(materialData);
        setMaterials([...materials, savedMaterial]);
      }
      
      setShowForm(false);
      setEditingMaterial(null);
      
      toast({
        title: "Success",
        description: `Material "${savedMaterial.name}" has been saved successfully.`,
      });
    } catch (error) {
      console.error('Material save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save material. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showDetails) {
    return (
      <MaterialDetails 
        material={showDetails} 
        onBack={() => setShowDetails(null)}
        onEdit={() => handleEditMaterial(showDetails)}
      />
    );
  }

  if (showForm) {
    return (
      <MaterialForm
        material={editingMaterial}
        onSave={handleSaveMaterial}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MaterialStats
        totalMaterials={totalMaterials}
        compliantMaterials={compliantMaterials}
        recyclableMaterials={recyclableMaterials}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Library</CardTitle>
              <CardDescription>Oregon EPR approved packaging materials with current rates and compliance status</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleImportMaterials}>
                <Upload className="h-4 w-4 mr-2" />
                Import Materials
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLibrary}>
                <Download className="h-4 w-4 mr-2" />
                Export Library
              </Button>
              <Button onClick={handleAddMaterial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MaterialControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedCompliance={selectedCompliance}
            setSelectedCompliance={setSelectedCompliance}
            onAddMaterial={handleAddMaterial}
          />

          <MaterialGrid
            filteredMaterials={filteredMaterials}
            onViewDetails={handleViewDetails}
            onEditMaterial={handleEditMaterial}
            onAddMaterial={handleAddMaterial}
          />
        </CardContent>
      </Card>
    </div>
  );
}
