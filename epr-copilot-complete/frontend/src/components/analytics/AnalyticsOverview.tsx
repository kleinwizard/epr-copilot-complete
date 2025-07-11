
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Scale,
  DollarSign,
  Recycle,
  Target,
  Leaf,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AnalyticsData } from '@/services/analyticsService';

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const { overview, sustainabilityMetrics } = data;
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalType, setGoalType] = useState<'percentage' | 'amount'>('percentage');
  const [goalValue, setGoalValue] = useState('');
  const [currentGoal, setCurrentGoal] = useState<{
    type: 'percentage' | 'amount';
    value: number;
    target: number;
    description: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentGoal();
  }, []);

  const loadCurrentGoal = async () => {
    try {
      const response = await fetch('/api/analytics/fee-optimization-goal');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.goal) {
          setCurrentGoal(data.goal);
        }
      }
    } catch (error) {
      console.error('Failed to load current goal:', error);
    }
  };

  const handleSaveGoal = async () => {
    if (!goalValue || isNaN(Number(goalValue))) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a valid number for your goal.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      type: goalType,
      target: Number(goalValue),
      description: goalType === 'percentage' 
        ? `Reduce total fees by ${goalValue}%`
        : `Achieve annual fees below $${Number(goalValue).toLocaleString()}`
    };

    try {
      const response = await fetch('/api/analytics/fee-optimization-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentGoal({
            ...goalData,
            value: result.current_value || 0
          });
          setIsGoalModalOpen(false);
          setGoalValue('');
          toast({
            title: "Goal Saved",
            description: "Your fee optimization goal has been saved successfully.",
          });
        }
      } else {
        throw new Error('Failed to save goal');
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast({
        title: "Error",
        description: "Failed to save your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateGoalProgress = () => {
    if (!currentGoal) return 0;
    
    if (currentGoal.type === 'percentage') {
      const targetReduction = (overview.totalFees * currentGoal.target) / 100;
      const actualSavings = overview.costSavings || 0;
      return Math.min(100, (actualSavings / targetReduction) * 100);
    } else {
      const currentFees = overview.totalFees;
      const targetFees = currentGoal.target;
      if (currentFees <= targetFees) return 100;
      const maxFees = targetFees * 1.5; // Assume 50% above target as 0% progress
      return Math.max(0, ((maxFees - currentFees) / (maxFees - targetFees)) * 100);
    }
  };

  const getGoalProgressText = () => {
    if (!currentGoal) return "No goal set";
    
    const progress = calculateGoalProgress();
    if (currentGoal.type === 'percentage') {
      const targetReduction = (overview.totalFees * currentGoal.target) / 100;
      const remaining = Math.max(0, targetReduction - (overview.costSavings || 0));
      return `$${remaining.toLocaleString()} more to reach ${currentGoal.target}% reduction goal`;
    } else {
      const currentFees = overview.totalFees;
      const remaining = Math.max(0, currentFees - currentGoal.target);
      return remaining > 0 
        ? `$${remaining.toLocaleString()} above target of $${currentGoal.target.toLocaleString()}`
        : `Target achieved! $${(currentGoal.target - currentFees).toLocaleString()} under target`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tutorial="analytics-widgets">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total EPR Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${overview.totalFees.toLocaleString()}</div>
          <div className="flex items-center space-x-2 mt-2">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+{overview.quarterlyGrowth}% this quarter</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Saved ${overview.costSavings.toLocaleString()} via recyclability
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Products</CardTitle>
          <Package className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalProducts.toLocaleString()}</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              5 categories
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all product lines
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
          <Scale className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(overview.totalWeight / 1000).toFixed(1)}kg</div>
          <div className="mt-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Q4 2024
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Packaging materials reported
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recyclability Rate</CardTitle>
          <Recycle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{overview.recyclabilityRate}%</div>
          <div className="mt-2">
            <Progress value={overview.recyclabilityRate} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Above industry average (65%)
          </p>
        </CardContent>
      </Card>

      {/* Sustainability Metrics Row */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <span>Sustainability Metrics</span>
          </CardTitle>
          <CardDescription>Environmental impact indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Recyclable Materials</span>
                <span className="text-sm text-green-600">{sustainabilityMetrics.recyclablePercentage}%</span>
              </div>
              <Progress value={sustainabilityMetrics.recyclablePercentage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Circularity Score</span>
                <span className="text-sm text-blue-600">{sustainabilityMetrics.circularityScore}/100</span>
              </div>
              <Progress value={sustainabilityMetrics.circularityScore} className="h-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">{sustainabilityMetrics.wasteReduction}%</div>
              <div className="text-xs text-green-600">Waste Reduction</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-700">{sustainabilityMetrics.carbonFootprint}t</div>
              <div className="text-xs text-blue-600">Carbon Saved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2" data-tutorial="compliance-goals">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Compliance Goals</span>
          </CardTitle>
          <CardDescription>Progress toward sustainability targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">2024 Recyclability Target (75%)</span>
              <span className="text-sm">{overview.recyclabilityRate}% / 75%</span>
            </div>
            <Progress value={(overview.recyclabilityRate / 75) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overview.recyclabilityRate >= 75 
                ? `Goal achieved! ${(overview.recyclabilityRate - 75).toFixed(1)}% above target`
                : `${(75 - overview.recyclabilityRate).toFixed(1)}% to goal`
              }
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Fee Optimization Target</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">${overview.costSavings.toLocaleString()} saved</span>
                <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Set Fee Optimization Goal</DialogTitle>
                      <DialogDescription>
                        Define your target for reducing EPR fees to track progress
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="goalType">Goal Type</Label>
                        <Select value={goalType} onValueChange={(value: 'percentage' | 'amount') => setGoalType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage Reduction</SelectItem>
                            <SelectItem value="amount">Target Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="goalValue">
                          {goalType === 'percentage' ? 'Reduction Percentage' : 'Target Annual Fees'}
                        </Label>
                        <div className="relative">
                          {goalType === 'amount' && (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          )}
                          <Input
                            id="goalValue"
                            type="number"
                            value={goalValue}
                            onChange={(e) => setGoalValue(e.target.value)}
                            placeholder={goalType === 'percentage' ? '15' : '50000'}
                            className={goalType === 'amount' ? 'pl-6' : ''}
                          />
                          {goalType === 'percentage' && (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {goalType === 'percentage' 
                            ? 'Enter the percentage by which you want to reduce your total EPR fees'
                            : 'Enter the maximum annual EPR fees you want to achieve'
                          }
                        </p>
                      </div>
                      
                      {currentGoal && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Current Goal</p>
                          <p className="text-sm text-blue-700">{currentGoal.description}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsGoalModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveGoal}>
                          {currentGoal ? 'Update Goal' : 'Set Goal'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Progress value={calculateGoalProgress()} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{getGoalProgressText()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
