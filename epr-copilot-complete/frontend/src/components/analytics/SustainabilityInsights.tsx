
import { SustainabilityMetrics } from './sustainability/SustainabilityMetrics';
import { SustainabilityCharts } from './sustainability/SustainabilityCharts';
import { SustainabilityInitiatives } from './sustainability/SustainabilityInitiatives';

export function SustainabilityInsights() {
  return (
    <div className="space-y-6">
      <SustainabilityMetrics />
      <SustainabilityCharts />
      <SustainabilityInitiatives />
    </div>
  );
}
