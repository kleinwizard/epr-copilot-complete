import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { calculateFeeProjections } from '@/services/analyticsService';
import { MetricWithInfo } from './MetricWithInfo';

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

  return (
    <div className="space-y-6">
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
        <MetricWithInfo
          title="Recyclability Savings"
          value={isLoading ? 'Loading...' : `-$${projectionMetrics.costOptimization.toLocaleString()}`}
          explanation="This figure estimates how much you could save on your projected annual fees by increasing your overall recyclability rate by a target percentage. It models the fee reductions you would receive for using more sustainable materials."
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {isLoading ? 'Loading...' : `-$${projectionMetrics.costOptimization.toLocaleString()}`}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Potential annual savings</p>
              <ul className="text-sm space-y-2">
                <li>• Increase recyclable materials by 5%</li>
                <li>• Optimize packaging weights (-8%)</li>
                <li>• Switch to lower EPR rate materials</li>
                <li>• Implement automated compliance tracking</li>
              </ul>
              <Button size="sm" className="mt-3 w-full">
                View Optimization Plan
              </Button>
            </CardContent>
          </Card>
        </MetricWithInfo>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {isLoading ? 'Loading...' : projectionMetrics.riskLevel}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Current risk level</p>
            <ul className="text-sm space-y-2">
              <li>• {isLoading ? 'Loading...' : `${projectionMetrics.recyclabilityRate}% recyclability rate`}</li>
              <li>• All deadlines met this year</li>
              <li>• Strong recyclability rate ({isLoading ? 'Loading...' : `${projectionMetrics.recyclabilityRate}%`})</li>
              <li>• Proactive monitoring in place</li>
            </ul>
            <Button size="sm" variant="outline" className="mt-3 w-full">
              Risk Analysis Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {isLoading ? 'Loading...' : `${projectionMetrics.growthRate > 0 ? '+' : ''}${projectionMetrics.growthRate}%`}
            </div>
            <p className="text-sm text-muted-foreground mb-4">Quarterly growth rate</p>
            <ul className="text-sm space-y-2">
              <li>• Product portfolio expansion</li>
              <li>• New market entries planned</li>
              <li>• Sustainable packaging adoption</li>
              <li>• Digital transformation benefits</li>
            </ul>
            <Button size="sm" variant="outline" className="mt-3 w-full">
              Growth Strategy
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
