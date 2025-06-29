
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus } from 'lucide-react';
import { MaterialDetails } from './MaterialDetails';
import { MaterialForm } from './MaterialForm';
import { MaterialStats } from './MaterialStats';
import { MaterialControls } from './MaterialControls';
import { MaterialGrid } from './MaterialGrid';

interface Material {
  id: number;
  name: string;
  category: string;
  type: string;
  recyclable: boolean;
  eprRate: number;
  densityRange: { min: number; max: number };
  sustainabilityScore: number;
  alternatives: string[];
  complianceStatus: 'Compliant' | 'Restricted' | 'Banned';
  lastUpdated: string;
  description: string;
  carbonFootprint: number;
  recyclingProcess: string;
  endOfLife: string[];
}

// Mock data for Oregon EPR materials
const mockMaterials: Material[] = [
  {
    id: 1,
    name: "Glass (Clear)",
    category: "Glass",
    type: "Container",
    recyclable: true,
    eprRate: 0.0012,
    densityRange: { min: 2.4, max: 2.8 },
    sustainabilityScore: 85,
    alternatives: ["Glass (Amber)", "Glass (Green)"],
    complianceStatus: "Compliant",
    lastUpdated: "2024-01-15",
    description: "Clear glass containers commonly used for food and beverage packaging",
    carbonFootprint: 0.85,
    recyclingProcess: "Mechanical recycling - melting and reforming",
    endOfLife: ["Recycling", "Reuse", "Landfill"]
  },
  {
    id: 2,
    name: "PET Plastic",
    category: "Plastic",
    type: "Container",
    recyclable: true,
    eprRate: 0.0034,
    densityRange: { min: 1.3, max: 1.4 },
    sustainabilityScore: 65,
    alternatives: ["rPET", "Glass", "Aluminum"],
    complianceStatus: "Compliant",
    lastUpdated: "2024-01-20",
    description: "Polyethylene terephthalate - widely recyclable plastic",
    carbonFootprint: 2.3,
    recyclingProcess: "Chemical and mechanical recycling",
    endOfLife: ["Recycling", "Energy Recovery", "Landfill"]
  },
  {
    id: 3,
    name: "LDPE Film",
    category: "Plastic",
    type: "Flexible Packaging",
    recyclable: false,
    eprRate: 0.0089,
    densityRange: { min: 0.91, max: 0.94 },
    sustainabilityScore: 25,
    alternatives: ["Compostable Films", "Paper", "Reusable Containers"],
    complianceStatus: "Restricted",
    lastUpdated: "2024-01-22",
    description: "Low-density polyethylene films - limited recycling options",
    carbonFootprint: 1.8,
    recyclingProcess: "Limited - specialized facilities only",
    endOfLife: ["Energy Recovery", "Landfill"]
  },
  {
    id: 4,
    name: "Aluminum",
    category: "Metal",
    type: "Container",
    recyclable: true,
    eprRate: 0.0008,
    densityRange: { min: 2.7, max: 2.7 },
    sustainabilityScore: 95,
    alternatives: ["Steel", "Glass"],
    complianceStatus: "Compliant",
    lastUpdated: "2024-01-18",
    description: "Infinitely recyclable aluminum packaging",
    carbonFootprint: 1.2,
    recyclingProcess: "Mechanical recycling - melting and reforming",
    endOfLife: ["Recycling", "Reuse"]
  }
];

export function MaterialLibrary() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCompliance, setSelectedCompliance] = useState("all");
  const [showDetails, setShowDetails] = useState<Material | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

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
  const avgSustainabilityScore = materials.reduce((sum, m) => sum + m.sustainabilityScore, 0) / materials.length;

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

  const handleSaveMaterial = (materialData: Partial<Material>) => {
    if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...materialData, id: editingMaterial.id } as Material : m));
    } else {
      setMaterials([...materials, { ...materialData, id: Date.now() } as Material]);
    }
    setShowForm(false);
    setEditingMaterial(null);
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
        avgSustainabilityScore={avgSustainabilityScore}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Material Library</CardTitle>
              <CardDescription>Oregon EPR approved packaging materials with current rates and compliance status</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Materials
              </Button>
              <Button variant="outline" size="sm">
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
