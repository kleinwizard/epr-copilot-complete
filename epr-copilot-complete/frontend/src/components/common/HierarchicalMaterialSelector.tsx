import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown,
  ChevronRight,
  Search,
  Package
} from 'lucide-react';

interface MaterialCategory {
  id: string;
  name: string;
  children?: MaterialCategory[];
}

interface HierarchicalMaterialSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  jurisdiction?: string;
  placeholder?: string;
}

const materialHierarchy: Record<string, MaterialCategory[]> = {
  CA: [
    {
      id: 'plastic',
      name: 'Plastic',
      children: [
        {
          id: 'plastic-rigid',
          name: 'Rigid Plastic',
          children: [
            { id: 'plastic-rigid-bottle', name: 'Bottle' },
            { id: 'plastic-rigid-container', name: 'Container' },
            { id: 'plastic-rigid-tub', name: 'Tub' }
          ]
        },
        {
          id: 'plastic-flexible',
          name: 'Flexible Plastic',
          children: [
            { id: 'plastic-flexible-bag', name: 'Bag' },
            { id: 'plastic-flexible-wrap', name: 'Wrap' },
            { id: 'plastic-flexible-pouch', name: 'Pouch' }
          ]
        }
      ]
    },
    {
      id: 'paper',
      name: 'Paper',
      children: [
        {
          id: 'paper-corrugated',
          name: 'Corrugated',
          children: [
            { id: 'paper-corrugated-box', name: 'Box' },
            { id: 'paper-corrugated-sheet', name: 'Sheet' }
          ]
        },
        {
          id: 'paper-molded',
          name: 'Molded Fiber',
          children: [
            { id: 'paper-molded-tray', name: 'Tray' },
            { id: 'paper-molded-cup', name: 'Cup' }
          ]
        }
      ]
    }
  ],
  OR: [
    {
      id: 'glass',
      name: 'Glass',
      children: [
        { id: 'glass-bottle', name: 'Bottle' },
        { id: 'glass-jar', name: 'Jar' }
      ]
    },
    {
      id: 'metal',
      name: 'Metal',
      children: [
        {
          id: 'metal-aluminum',
          name: 'Aluminum',
          children: [
            { id: 'metal-aluminum-can', name: 'Can' },
            { id: 'metal-aluminum-foil', name: 'Foil' }
          ]
        },
        {
          id: 'metal-steel',
          name: 'Steel',
          children: [
            { id: 'metal-steel-can', name: 'Can' },
            { id: 'metal-steel-lid', name: 'Lid' }
          ]
        }
      ]
    }
  ],
  ME: [
    {
      id: 'plastic',
      name: 'Plastic',
      children: [
        { id: 'plastic-pet', name: 'PET' },
        { id: 'plastic-hdpe', name: 'HDPE' },
        { id: 'plastic-ldpe', name: 'LDPE' },
        { id: 'plastic-pp', name: 'PP' },
        { id: 'plastic-ps', name: 'PS' },
        { id: 'plastic-other', name: 'Other' }
      ]
    }
  ]
};

export function HierarchicalMaterialSelector({ 
  value, 
  onValueChange, 
  jurisdiction = 'OR',
  placeholder = "Select material"
}: HierarchicalMaterialSelectorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const materials = materialHierarchy[jurisdiction] || materialHierarchy.OR;

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectMaterial = (materialId: string, path: string[]) => {
    setSelectedPath(path);
    onValueChange(materialId);
  };

  const renderMaterialNode = (material: MaterialCategory, level: number = 0, path: string[] = []) => {
    const currentPath = [...path, material.name];
    const hasChildren = material.children && material.children.length > 0;
    const isExpanded = expandedNodes.has(material.id);
    const isSelected = value === material.id;

    if (searchTerm && !material.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={material.id} className="space-y-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(material.id);
            } else {
              selectMaterial(material.id, currentPath);
            }
          }}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4 h-4" />}
          
          <Package className="w-4 h-4 text-gray-500" />
          <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : ''}`}>
            {material.name}
          </span>
          
          {isSelected && (
            <Badge variant="secondary" className="ml-auto">Selected</Badge>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {material.children?.map(child => 
              renderMaterialNode(child, level + 1, currentPath)
            )}
          </div>
        )}
      </div>
    );
  };

  const getSelectedMaterialName = () => {
    if (!value) return placeholder;
    
    const findMaterial = (materials: MaterialCategory[]): string | null => {
      for (const material of materials) {
        if (material.id === value) return material.name;
        if (material.children) {
          const found = findMaterial(material.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findMaterial(materials) || value;
  };

  return (
    <div className="space-y-2">
      <Label>Material</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {getSelectedMaterialName()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="w-80">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {materials.map(material => renderMaterialNode(material))}
          </div>
          
          {selectedPath.length > 0 && (
            <div className="p-2 border-t bg-gray-50">
              <p className="text-xs text-gray-600">
                Selected: {selectedPath.join(' > ')}
              </p>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
