
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2, Info } from 'lucide-react';
import { CalculationEngine, oregonEprRates, FeeCalculationRequestV1, PackagingComponentV1, ProducerDataV1 } from '@/services/calculationEngine';
import { JurisdictionSelector } from '@/components/common/JurisdictionSelector';
import { FeeBreakdown } from './FeeBreakdown';
import { useToast } from '@/hooks/use-toast';

interface Material {
  type: string;
  weight: number;
  recyclable: boolean;
}

export function FeeCalculator() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState<Material>({
    type: '',
    weight: 0,
    recyclable: true
  });
  const [monthlyVolume, setMonthlyVolume] = useState(1);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('OR');
  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addMaterial = () => {
    if (newMaterial.type && newMaterial.weight > 0) {
      setMaterials([...materials, { ...newMaterial }]);
      setNewMaterial({ type: '', weight: 0, recyclable: true });
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: any) => {
    setMaterials(materials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ));
  };

  const calculateFees = async () => {
    if (materials.length === 0) {
      setCalculation(null);
      toast({
        title: "No Materials",
        description: "Please add at least one material to calculate fees.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    setError(null);
    
    try {
      const invalidMaterials = materials.filter(m => !m.type || m.weight <= 0);
      if (invalidMaterials.length > 0) {
        throw new Error('All materials must have a type and positive weight');
      }

      const packagingData: PackagingComponentV1[] = materials.map((material, index) => ({
        material_type: material.type,
        component_name: `Component ${index + 1}`,
        weight_per_unit: material.weight / 1000,
        weight_unit: 'kg',
        units_sold: monthlyVolume || 1,
        recycled_content_percentage: 0,
        recyclable: material.recyclable,
        reusable: false,
        disrupts_recycling: false,
        recyclability_score: material.recyclable ? 0.8 : 0.2,
        carbon_footprint: 0,
        water_usage: 0,
        contains_pfas: false,
        contains_phthalates: false,
        marine_degradable: false,
        harmful_to_marine_life: false,
        bay_friendly: false,
        cold_weather_stable: true
      }));

      const producerData: ProducerDataV1 = {
        organization_id: 'demo-org',
        annual_revenue: 5000000,
        annual_tonnage: 10,
        produces_perishable_food: false,
        has_lca_disclosure: false,
        has_environmental_impact_reduction: false,
        uses_reusable_packaging: false,
        annual_recycling_rates: []
      };

      const request: FeeCalculationRequestV1 = {
        jurisdiction_code: selectedJurisdiction || 'OR',
        producer_data: producerData,
        packaging_data: packagingData,
        calculation_date: new Date().toISOString(),
        data_source: 'frontend_calculator'
      };

      const result = await CalculationEngine.calculateEprFeeV1(request);
      setCalculation({
        totalFee: result.total_fee,
        breakdown: result.calculation_breakdown,
        calculationId: result.calculation_id,
        timestamp: result.calculation_timestamp,
        materials: materials.map((m, idx) => ({
          ...m,
          fee: result.calculation_breakdown?.material_fees?.[idx] || 0
        })),
        ...result
      });

      toast({
        title: "Calculation Complete",
        description: `Total EPR fee: $${result.total_fee.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Fee calculation error:', error);
      let errorMessage = 'Failed to calculate fees. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authentication')) {
          errorMessage = 'Authentication required. Please log in again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (import.meta.env.MODE === 'development') {
        const mockFee = materials.reduce((sum, m) => sum + (m.weight * 0.005), 0);
        setCalculation({
          totalFee: mockFee * monthlyVolume,
          breakdown: {
            base_fee: mockFee,
            volume_multiplier: monthlyVolume,
            total: mockFee * monthlyVolume
          },
          calculationId: 'mock-' + Date.now(),
          timestamp: new Date().toISOString(),
          materials: materials.map(m => ({
            ...m,
            fee: m.weight * 0.005
          })),
          total_fee: mockFee * monthlyVolume,
          currency: 'USD',
          compliance_status: 'compliant',
          jurisdiction: selectedJurisdiction
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const monthlyFee = calculation ? calculation.total_fee : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>EPR Fee Calculator</span>
          </CardTitle>
          <CardDescription>
            Calculate Extended Producer Responsibility fees for your packaging materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Jurisdiction Selection */}
          <div className="space-y-2">
            <Label>Jurisdiction</Label>
            <JurisdictionSelector
              value={selectedJurisdiction}
              onValueChange={setSelectedJurisdiction}
              placeholder="Select jurisdiction"
            />
          </div>

          {/* Add Material Form */}
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <h4 className="font-medium mb-3">Add Packaging Material</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select 
                  value={newMaterial.type} 
                  onValueChange={(value) => setNewMaterial(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(oregonEprRates).map(material => (
                      <SelectItem key={material} value={material}>
                        <div className="flex items-center justify-between w-full">
                          <span>{material}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            ${oregonEprRates[material as keyof typeof oregonEprRates]}/kg
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Weight (grams)</Label>
                <Input
                  type="number"
                  value={newMaterial.weight || ''}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Recyclable</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={newMaterial.recyclable}
                    onCheckedChange={(checked) => setNewMaterial(prev => ({ ...prev, recyclable: checked }))}
                  />
                  <span className="text-sm">{newMaterial.recyclable ? 'Yes (25% discount)' : 'No'}</span>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={() => {
                    addMaterial();
                    calculateFees();
                  }}
                  disabled={!newMaterial.type || newMaterial.weight <= 0}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Monthly Volume and Calculate Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Production Volume</Label>
              <Input
                type="number"
                value={monthlyVolume}
                onChange={(e) => {
                  setMonthlyVolume(Number(e.target.value));
                  if (materials.length > 0) calculateFees();
                }}
                min="1"
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                How many units of this product do you produce per month?
              </p>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={calculateFees}
                disabled={materials.length === 0 || isCalculating}
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isCalculating ? 'Calculating...' : 'Calculate Fees'}
              </Button>
            </div>
          </div>

          {/* Materials List */}
          <div className="space-y-3">
            <h4 className="font-medium">Added Materials</h4>
            {materials.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No materials added yet</p>
                <p className="text-sm">Add materials above to calculate EPR fees</p>
              </div>
            ) : (
              materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{material.type}</span>
                        {material.recyclable && (
                          <Badge variant="outline" className="text-green-700 bg-green-50">
                            Recyclable
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {material.weight}g • ${oregonEprRates[material.type as keyof typeof oregonEprRates] || 0.50}/kg
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={material.weight}
                      onChange={(e) => {
                        updateMaterial(index, 'weight', Number(e.target.value));
                        calculateFees();
                      }}
                      className="w-20"
                      min="0"
                      step="0.1"
                    />
                    <Switch
                      checked={material.recyclable}
                      onCheckedChange={(checked) => {
                        updateMaterial(index, 'recyclable', checked);
                        calculateFees();
                      }}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        removeMaterial(index);
                        calculateFees();
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Calculation Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Calculation Results</CardTitle>
            <CardDescription>
              EPR fees for {calculation.jurisdiction} jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">Total Monthly Fee</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${monthlyFee.toFixed(2)} {calculation.currency}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Calculation ID:</span>
                  <span className="font-mono text-xs">{calculation.calculation_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance Status:</span>
                  <Badge variant={calculation.compliance_status === 'compliant' ? 'default' : 'destructive'}>
                    {calculation.compliance_status}
                  </Badge>
                </div>
              </div>

              {calculation.legal_citations && calculation.legal_citations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Legal Citations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {calculation.legal_citations.map((citation: string, index: number) => (
                      <li key={index}>• {citation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Multi-Jurisdictional EPR Fee Information</p>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• Fees are calculated per kilogram of packaging material</li>
                <li>• Each jurisdiction has unique fee structures and exemptions</li>
                <li>• Calculations include eco-modulation adjustments</li>
                <li>• Results include detailed audit trails for compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
