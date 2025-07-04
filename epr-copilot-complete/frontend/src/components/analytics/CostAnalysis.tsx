
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Calculator, Target, Lightbulb, ArrowRight, Zap } from 'lucide-react';
import { MetricWithInfo } from './MetricWithInfo';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  fees: { label: "Fees", color: "#ef4444" },
  savings: { label: "Savings", color: "#10b981" },
  projected: { label: "Projected", color: "#3b82f6" }
};


interface MaterialAlternative {
  id: string;
  productName: string;
  productSku: string;
  highCostComponent: string;
  currentMaterial: string;
  suggestedAlternative: string;
  currentCost: number;
  projectedSavings: number;
  annualSavings: number;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'Low' | 'Medium' | 'High';
  timeframe: string;
}

export function CostAnalysis() {
  const [costMetrics, setCostMetrics] = useState({
    currentQuarterlyFees: 0,
    quarterlyChange: 0,
    potentialSavings: 0,
    savingsPercentage: 0,
    costPerUnit: 0,
    avgCostPerUnit: 0,
    annualProjection: 0,
    yearOverYearChange: 0
  });
  
  const [costTrend, setCostTrend] = useState([]);
  const [costBreakdown, setCostBreakdown] = useState([]);
  const [optimizationOpportunities, setOptimizationOpportunities] = useState([]);
  const [materialAlternatives, setMaterialAlternatives] = useState<MaterialAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModelingToolOpen, setIsModelingToolOpen] = useState(false);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCostAnalysisData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/analytics/cost-analysis');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCostMetrics({
              currentQuarterlyFees: data.data.current_quarterly_fees || 0,
              quarterlyChange: data.data.quarterly_change || 0,
              potentialSavings: data.data.potential_savings || 0,
              savingsPercentage: data.data.savings_percentage || 0,
              costPerUnit: data.data.cost_per_unit || 0,
              avgCostPerUnit: data.data.avg_cost_per_unit || 0,
              annualProjection: data.data.annual_projection || 0,
              yearOverYearChange: data.data.year_over_year_change || 0
            });
            
            setCostTrend(data.data.cost_trend || []);
            setCostBreakdown(data.data.cost_breakdown || []);
            setOptimizationOpportunities(data.data.optimization_opportunities || []);
          }
        } else {
          setCostMetrics({
            currentQuarterlyFees: 0,
            quarterlyChange: 0,
            potentialSavings: 0,
            savingsPercentage: 0,
            costPerUnit: 0,
            avgCostPerUnit: 0,
            annualProjection: 0,
            yearOverYearChange: 0
          });
          
          setCostTrend([]);
          setCostBreakdown([]);
          setOptimizationOpportunities([]);
        }
      } catch (error) {
        console.error('Failed to load cost analysis data:', error);
        setCostMetrics({
          currentQuarterlyFees: 0,
          quarterlyChange: 0,
          potentialSavings: 0,
          savingsPercentage: 0,
          costPerUnit: 0,
          avgCostPerUnit: 0,
          annualProjection: 0,
          yearOverYearChange: 0
        });
        setCostTrend([]);
        setCostBreakdown([]);
        setOptimizationOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCostAnalysisData();
  }, []);

  const loadMaterialAlternatives = async () => {
    setIsLoadingAlternatives(true);
    try {
      const response = await fetch('/api/analytics/cost-modeling-alternatives');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMaterialAlternatives(data.data.alternatives || []);
        }
      } else {
        setMaterialAlternatives([]);
      }
    } catch (error) {
      console.error('Failed to load material alternatives:', error);
      setMaterialAlternatives([]);
      toast({
        title: "Error",
        description: "Failed to load cost modeling alternatives.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleStartOptimization = async (alternative: MaterialAlternative) => {
    try {
      const response = await fetch('/api/analytics/start-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSku: alternative.productSku,
          component: alternative.highCostComponent,
          currentMaterial: alternative.currentMaterial,
          suggestedMaterial: alternative.suggestedAlternative,
        }),
      });

      if (response.ok) {
        toast({
          title: "Optimization Started",
          description: `Started optimization analysis for ${alternative.productName}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to start optimization analysis.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to start optimization:', error);
      toast({
        title: "Error",
        description: "Failed to start optimization analysis.",
        variant: "destructive",
      });
    }
  };

  const openCostModelingTool = () => {
    setIsModelingToolOpen(true);
    loadMaterialAlternatives();
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-50">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Quarterly Fees</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">
                    {isLoading ? 'Loading...' : `$${costMetrics.currentQuarterlyFees.toLocaleString()}`}
                  </span>
                  {!isLoading && costMetrics.quarterlyChange !== 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {costMetrics.quarterlyChange > 0 ? '+' : ''}{costMetrics.quarterlyChange}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <MetricWithInfo
          title="Potential Savings"
          value={isLoading ? 'Loading...' : `$${costMetrics.potentialSavings.toLocaleString()}`}
          explanation="This metric estimates your potential annual savings. We analyze each material you use and identify if a more cost-effective, recyclable alternative is available. The total represents the sum of all possible savings if you were to make these substitutions."
          className="bg-green-50"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">
                      {isLoading ? 'Loading...' : `$${costMetrics.potentialSavings.toLocaleString()}`}
                    </span>
                    {!isLoading && costMetrics.savingsPercentage !== 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {costMetrics.savingsPercentage}% reduction
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MetricWithInfo>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calculator className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost per Unit</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">
                    {isLoading ? 'Loading...' : `$${costMetrics.costPerUnit.toFixed(3)}`}
                  </span>
                  {!isLoading && costMetrics.avgCostPerUnit !== 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      vs ${costMetrics.avgCostPerUnit.toFixed(3)} avg
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <MetricWithInfo
          title="Annual Projection"
          value={isLoading ? 'Loading...' : `$${Math.round(costMetrics.annualProjection / 1000)}k`}
          explanation="We project your annual fees by taking the average of your last 6 months of fees and then adjusting it based on your company's projected annual growth rate. This growth rate is calculated from your sales volume trends."
          className="bg-orange-50"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Target className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Projection</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      {isLoading ? 'Loading...' : `$${Math.round(costMetrics.annualProjection / 1000)}k`}
                    </span>
                    {!isLoading && costMetrics.yearOverYearChange !== 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {costMetrics.yearOverYearChange > 0 ? '+' : ''}${Math.round(costMetrics.yearOverYearChange / 1000)}k YoY
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </MetricWithInfo>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Trend Analysis</CardTitle>
            <CardDescription>Monthly fees vs recyclability savings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading cost trend data...</p>
                </div>
              </div>
            ) : costTrend.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500">No cost trend data available</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ComposedChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="fees" fill="var(--color-fees)" name="EPR Fees ($)" />
                  <Bar dataKey="savings" fill="var(--color-savings)" name="Recyclability Savings ($)" />
                  <Line type="monotone" dataKey="projected" stroke="var(--color-projected)" strokeWidth={3} strokeDasharray="5 5" name="Projected ($)" />
                </ComposedChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown by Material</CardTitle>
            <CardDescription>Distribution of EPR fees across material types</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading cost breakdown...</p>
                </div>
              </div>
            ) : costBreakdown.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-gray-500">No cost breakdown data available</p>
              </div>
            ) : (
              <>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {costBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.category}</span>
                      <span className="font-medium">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Cost Optimization Opportunities</span>
          </CardTitle>
          <CardDescription>Actionable recommendations to reduce EPR fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading optimization opportunities...</p>
              </div>
            ) : optimizationOpportunities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No optimization opportunities available</p>
              </div>
            ) : (
              optimizationOpportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={opportunity.impact === 'High' ? 'default' : opportunity.impact === 'Medium' ? 'secondary' : 'outline'}>
                        {opportunity.impact} Impact
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {opportunity.effort} Effort
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Cost</p>
                      <p className="text-lg font-bold">${opportunity.currentCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Saving</p>
                      <p className="text-lg font-bold text-green-600">${opportunity.potentialSaving.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeframe</p>
                      <p className="text-lg font-bold text-blue-600">{opportunity.timeframe}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      ROI: {((opportunity.potentialSaving / opportunity.currentCost) * 100).toFixed(1)}% annually
                    </div>
                    <Button size="sm" variant="outline">
                      View Implementation Plan
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <Dialog open={isModelingToolOpen} onOpenChange={setIsModelingToolOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={openCostModelingTool}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Cost Modeling Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Cost Modeling Tool</span>
                  </DialogTitle>
                  <DialogDescription>
                    Analyze your product catalog and identify cost-saving opportunities through material substitutions
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {materialAlternatives.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Opportunities Found</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${materialAlternatives.reduce((sum, alt) => sum + alt.annualSavings, 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Potential Savings</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {materialAlternatives.filter(alt => alt.impact === 'High').length}
                        </div>
                        <p className="text-sm text-muted-foreground">High-Impact Changes</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Optimization Opportunities</CardTitle>
                      <CardDescription>
                        Material substitutions ranked by projected annual savings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingAlternatives ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 mt-2">Analyzing your product catalog...</p>
                        </div>
                      ) : materialAlternatives.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No optimization opportunities found</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product Name/SKU</TableHead>
                              <TableHead>High-Cost Component</TableHead>
                              <TableHead>Current Material</TableHead>
                              <TableHead>Suggested Alternative</TableHead>
                              <TableHead>Projected Annual Savings</TableHead>
                              <TableHead>Impact</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {materialAlternatives
                              .sort((a, b) => b.annualSavings - a.annualSavings)
                              .map((alternative) => (
                                <TableRow key={alternative.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{alternative.productName}</div>
                                      <div className="text-sm text-muted-foreground">{alternative.productSku}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{alternative.highCostComponent}</TableCell>
                                  <TableCell>{alternative.currentMaterial}</TableCell>
                                  <TableCell className="font-medium text-green-600">
                                    {alternative.suggestedAlternative}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-bold text-green-600">
                                      ${alternative.annualSavings.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {alternative.timeframe}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Badge 
                                        variant={alternative.impact === 'High' ? 'default' : alternative.impact === 'Medium' ? 'secondary' : 'outline'}
                                      >
                                        {alternative.impact}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {alternative.effort} Effort
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleStartOptimization(alternative)}
                                      className="flex items-center space-x-1"
                                    >
                                      <Zap className="h-3 w-3" />
                                      <span>Start Optimization</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm">
              Start Optimization Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
