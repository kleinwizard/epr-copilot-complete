
import { Button } from '@/components/ui/button';
import { Package2, Plus } from 'lucide-react';
import { MaterialCard } from './MaterialCard';

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

interface MaterialGridProps {
  filteredMaterials: Material[];
  onViewDetails: (material: Material) => void;
  onEditMaterial: (material: Material) => void;
  onAddMaterial: () => void;
}

export function MaterialGrid({ 
  filteredMaterials, 
  onViewDetails, 
  onEditMaterial, 
  onAddMaterial 
}: MaterialGridProps) {
  if (filteredMaterials.length === 0) {
    return (
      <div className="text-center py-8">
        <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search or filters, or add a new material.</p>
        <Button onClick={onAddMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Your First Material
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredMaterials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onViewDetails={() => onViewDetails(material)}
          onEdit={() => onEditMaterial(material)}
        />
      ))}
    </div>
  );
}
