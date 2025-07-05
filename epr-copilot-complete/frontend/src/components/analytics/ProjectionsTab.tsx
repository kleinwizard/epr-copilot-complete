import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, FileText, AlertTriangle, BarChart3 } from 'lucide-react';
import { calculateFeeProjections } from '@/services/analyticsService';
import { MetricWithInfo } from './MetricWithInfo';
import { useToast } from '@/hooks/use-toast';

const chartConfig = {
  projected: { label: "Projected", color: "#ef4444" }
};

export function ProjectionsTab() {
  const [projections, setProjections] = useState<Array<{month: string, projected: number}> | null>([]);
  const [projectionMetrics, setProjectionMetrics] = useState({
    quarterlyGrowth: 0,
    annualFees: 0,
    yearOverYearIncrease: 0,
    recyclabilitySavings: 0,
    discountOpportunities: 0,
    costOptimization: 0,
    riskLevel: 'Unknown',
    recyclabilityRate: 0,
    growthRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [optimizationPlan, setOptimizationPlan] = useState<any>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);
  const [growthStrategy, setGrowthStrategy] = useState<any>(null);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProjectionsData = async () => {
      try {
        setIsLoading(true);
        
        const projectionsResponse = await fetch('/api/analytics/fee-projections-chart');
        if (projectionsResponse.ok) {
          const projectionsData = await projectionsResponse.json();
          if (projectionsData.success && projectionsData.status !== 'insufficient_data') {
            setProjections(projectionsData.data);
          } else {
            setProjections(null); // Insufficient data
          }
        } else {
          setProjections(await calculateFeeProjections(6)); // Fallback
        }
        
        const metricsResponse = await fetch('/api/analytics/projections-metrics');
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          if (metricsData.success) {
            setProjectionMetrics({
              quarterlyGrowth: metricsData.data.quarterly_growth || 0,
              annualFees: metricsData.data.annual_fees || 0,
              yearOverYearIncrease: metricsData.data.year_over_year_increase || 0,
              recyclabilitySavings: metricsData.data.recyclability_savings || 0,
              discountOpportunities: metricsData.data.discount_opportunities || 0,
              costOptimization: metricsData.data.cost_optimization || 0,
              riskLevel: metricsData.data.risk_level || 'Unknown',
              recyclabilityRate: metricsData.data.recyclability_rate || 0,
              growthRate: metricsData.data.growth_rate || 0
            });
          }
        } else {
          setProjectionMetrics({
            quarterlyGrowth: 0,
            annualFees: 0,
            yearOverYearIncrease: 0,
            recyclabilitySavings: 0,
            discountOpportunities: 0,
            costOptimization: 0,
            riskLevel: 'Unknown',
            recyclabilityRate: 0,
            growthRate: 0
          });
        }
      } catch (error) {
        console.error('Failed to load projections data:', error);
        setProjections(null);
        setProjectionMetrics({
          quarterlyGrowth: 0,
          annualFees: 0,
          yearOverYearIncrease: 0,
          recyclabilitySavings: 0,
          discountOpportunities: 0,
          costOptimization: 0,
          riskLevel: 'Unknown',
          recyclabilityRate: 0,
          growthRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectionsData();
  }, []);

  const handleOptimizationPlan = async () => {
    try {
      setIsOptimizationOpen(true);
      if (!optimizationPlan) {
        const response = await fetch('/api/analytics/optimization-plan');
        if (response.ok) {
          const data = await response.json();
          setOptimizationPlan(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load optimization plan",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load optimization plan:', error);
      toast({
        title: "Error",
        description: "Failed to load optimization plan",
        variant: "destructive",
      });
    }
  };

  const handleRiskAnalysis = async () => {
    try {
      setIsRiskOpen(true);
      if (!riskAnalysis) {
        const response = await fetch('/api/analytics/risk-analysis');
        if (response.ok) {
          const data = await response.json();
          setRiskAnalysis(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load risk analysis",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load risk analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load risk analysis",
        variant: "destructive",
      });
    }
  };

  const handleGrowthStrategy = async () => {
    try {
      setIsGrowthOpen(true);
      if (!growthStrategy) {
        const response = await fetch('/api/analytics/growth-strategy?target_jurisdiction=CA');
        if (response.ok) {
          const data = await response.json();
          setGrowthStrategy(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load growth strategy",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load growth strategy:', error);
      toast({
        title: "Error",
        description: "Failed to load growth strategy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6" data-tutorial="projections-section">
      <MetricWithInfo
        title="Fee Projections Chart"
        value="6-Month Forecast"
        explanation="This chart forecasts your EPR fees for the next 6 months. It analyzes your fee payments over the past year to find a trend (using linear regression) and extends that trend into the future."
        status={projections === null ? "insufficient_data" : "success"}
      >
        {projections !== null ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Fee Projections & Forecasting</span>
              </CardTitle>
              <CardDescription>6-month fee projections based on current trends and planned changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="projected" 
                    stroke="var(--color-projected)" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    name="Projected Fees ($)"
                  />
                </LineChart>
              </ChartContainer>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Key Insights & Recommendations</h4>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-blue-700 text-sm mt-2">Loading insights...</p>
                  </div>
                ) : (
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Projected {projectionMetrics.quarterlyGrowth}% quarterly growth based on current trends</li>
                    <li>• Estimated annual fees: ${projectionMetrics.annualFees.toLocaleString()} (+${projectionMetrics.yearOverYearIncrease.toLocaleString()} vs current year)</li>
                    <li>• Recyclability improvements could save an additional ${projectionMetrics.recyclabilitySavings.toLocaleString()}</li>
                    <li>• Early compliance submissions offer {projectionMetrics.discountOpportunities}% discount opportunities</li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </MetricWithInfo>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Cost Optimization</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {isLoading ? 'Loading...' : `-$${projectionMetrics.costOptimization.toLocaleString()}`}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Potential annual savings</p>
            <ul className="text-sm space-y-2">
              {isLoading ? (
                <>
                  <li>• Loading optimization opportunities...</li>
                  <li>• Analyzing material alternatives...</li>
                  <li>• Calculating potential savings...</li>
                </>
              ) : (
                <>
                  <li>• Potential savings from material substitution: ${projectionMetrics.costOptimization > 0 ? (projectionMetrics.costOptimization * 0.4).toLocaleString() : '0'}</li>
                  <li>• Recyclability improvements could save: ${projectionMetrics.recyclabilitySavings.toLocaleString()}</li>
                  <li>• {projectionMetrics.discountOpportunities}% early compliance discount available</li>
                  <li>• Automated tracking could reduce admin costs by 15%</li>
                </>
              )}
            </ul>
            <Dialog open={isOptimizationOpen} onOpenChange={setIsOptimizationOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-auto w-full" onClick={handleOptimizationPlan}>
                  View Optimization Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Cost Optimization Plan</span>
                  </DialogTitle>
                  <DialogDescription>
                    Actionable opportunities to reduce your EPR fees through material substitution
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {optimizationPlan ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Total Potential Savings</h4>
                        <p className="text-2xl font-bold text-green-700">
                          ${optimizationPlan.total_potential_savings?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          {optimizationPlan.message || 'No optimization opportunities found'}
                        </p>
                      </div>
                      
                      {optimizationPlan.opportunities?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Optimization Opportunities</h4>
                          {optimizationPlan.opportunities.map((opp: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{opp.title}</h5>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  opp.impact === 'High' ? 'bg-red-100 text-red-800' :
                                  opp.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {opp.impact} Impact
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Product:</span> {opp.productName}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Component:</span> {opp.componentName}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Current Material:</span> {opp.currentMaterial}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Suggested Material:</span> {opp.suggestedMaterial}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Potential Saving:</span> 
                                  <span className="font-medium text-green-600"> ${opp.potentialSaving?.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Implementation:</span> {opp.effort} effort, {opp.timeframe}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading optimization plan...</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {isLoading ? 'Loading...' : projectionMetrics.riskLevel}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Current risk level</p>
            <ul className="text-sm space-y-2">
              {isLoading ? (
                <>
                  <li>• Loading compliance data...</li>
                  <li>• Analyzing risk factors...</li>
                  <li>• Calculating risk score...</li>
                </>
              ) : (
                <>
                  <li>• Current recyclability rate: {projectionMetrics.recyclabilityRate}%</li>
                  <li>• Compliance status: {projectionMetrics.riskLevel === 'Low' || projectionMetrics.riskLevel === 'Very Low' ? 'On track' : 'Needs attention'}</li>
                  <li>• Risk assessment: {projectionMetrics.riskLevel} risk level</li>
                  <li>• {projectionMetrics.riskLevel === 'Low' || projectionMetrics.riskLevel === 'Very Low' ? 'Proactive monitoring in place' : 'Action required for compliance'}</li>
                </>
              )}
            </ul>
            <Dialog open={isRiskOpen} onOpenChange={setIsRiskOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="mt-auto w-full" onClick={handleRiskAnalysis}>
                  Risk Analysis Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Compliance Risk Analysis</span>
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive analysis of your compliance risk factors and recommendations
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {riskAnalysis ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        riskAnalysis.risk_level === 'High' ? 'bg-red-50' :
                        riskAnalysis.risk_level === 'Medium' ? 'bg-yellow-50' :
                        'bg-green-50'
                      }`}>
                        <h4 className={`font-medium mb-2 ${
                          riskAnalysis.risk_level === 'High' ? 'text-red-900' :
                          riskAnalysis.risk_level === 'Medium' ? 'text-yellow-900' :
                          'text-green-900'
                        }`}>
                          Risk Assessment
                        </h4>
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className={`text-2xl font-bold ${
                              riskAnalysis.risk_level === 'High' ? 'text-red-700' :
                              riskAnalysis.risk_level === 'Medium' ? 'text-yellow-700' :
                              'text-green-700'
                            }`}>
                              {riskAnalysis.risk_level}
                            </p>
                            <p className="text-sm">Risk Level</p>
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${
                              riskAnalysis.risk_level === 'High' ? 'text-red-700' :
                              riskAnalysis.risk_level === 'Medium' ? 'text-yellow-700' :
                              'text-green-700'
                            }`}>
                              {riskAnalysis.risk_score}/100
                            </p>
                            <p className="text-sm">Risk Score</p>
                          </div>
                        </div>
                        <p className={`text-sm mt-2 ${
                          riskAnalysis.risk_level === 'High' ? 'text-red-600' :
                          riskAnalysis.risk_level === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {riskAnalysis.message}
                        </p>
                      </div>
                      
                      {riskAnalysis.risk_factors?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Risk Factors</h4>
                          {riskAnalysis.risk_factors.map((factor: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{factor.type}</h5>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  factor.impact === 'High' ? 'bg-red-100 text-red-800' :
                                  factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {factor.impact} Impact
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{factor.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {riskAnalysis.recommendations?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Recommendations</h4>
                          <ul className="space-y-1">
                            {riskAnalysis.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm flex items-start space-x-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading risk analysis...</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Growth Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {isLoading ? 'Loading...' : `${projectionMetrics.growthRate > 0 ? '+' : ''}${projectionMetrics.growthRate}%`}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Quarterly growth rate</p>
            <ul className="text-sm space-y-2">
              {isLoading ? (
                <>
                  <li>• Loading growth projections...</li>
                  <li>• Analyzing market opportunities...</li>
                  <li>• Calculating expansion costs...</li>
                </>
              ) : (
                <>
                  <li>• Projected quarterly growth: {projectionMetrics.growthRate > 0 ? '+' : ''}{projectionMetrics.growthRate}%</li>
                  <li>• Market expansion opportunities identified</li>
                  <li>• Sustainable packaging adoption: {projectionMetrics.recyclabilityRate}% current rate</li>
                  <li>• Annual fee projection: ${projectionMetrics.annualFees.toLocaleString()}</li>
                </>
              )}
            </ul>
            <Dialog open={isGrowthOpen} onOpenChange={setIsGrowthOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="mt-auto w-full" onClick={handleGrowthStrategy}>
                  Growth Strategy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Growth Strategy Analysis</span>
                  </DialogTitle>
                  <DialogDescription>
                    Market expansion costing and growth scenarios for strategic planning
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  {growthStrategy ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Market Expansion Cost</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          ${growthStrategy.expansion_cost?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Annual EPR fees for {growthStrategy.target_jurisdiction || 'target market'}
                        </p>
                        {growthStrategy.cost_increase_percentage && (
                          <p className="text-sm text-blue-600">
                            {growthStrategy.cost_increase_percentage > 0 ? '+' : ''}{growthStrategy.cost_increase_percentage}% vs current fees
                          </p>
                        )}
                      </div>
                      
                      {growthStrategy.scenarios?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium">Growth Scenarios</h4>
                          {growthStrategy.scenarios.map((scenario: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{scenario.name}</h5>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  scenario.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                                  scenario.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {scenario.risk_level} Risk
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Annual Cost:</span>
                                  <span className="font-medium"> ${scenario.annual_cost?.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Timeline:</span> {scenario.timeline}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Revenue Increase:</span> {scenario.potential_revenue_increase}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Risk Level:</span> {scenario.risk_level}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {growthStrategy.recommendations?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Strategic Recommendations</h4>
                          <ul className="space-y-1">
                            {growthStrategy.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm flex items-start space-x-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading growth strategy...</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
