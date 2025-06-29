import { EnhancedMaterial } from './enhancedFeeCalculation';

export interface EcoModulationFactors {
  carbonFootprint: number;
  recycledContent: number;
  biodegradability: number;
  reusability: number;
  localSourcing: number;
  certifications: string[];
}

export interface EcoModulationResult {
  originalFee: number;
  modulatedFee: number;
  totalAdjustment: number;
  adjustmentPercentage: number;
  breakdown: {
    carbonFootprintAdjustment: number;
    recycledContentBonus: number;
    biodegradabilityBonus: number;
    reusabilityBonus: number;
    localSourcingBonus: number;
    certificationBonus: number;
  };
  sustainabilityScore: number;
}

export interface CertificationBonuses {
  'FSC': 0.05;          // Forest Stewardship Council
  'PEFC': 0.04;         // Programme for the Endorsement of Forest Certification
  'Cradle to Cradle': 0.08;
  'GREENGUARD': 0.03;
  'Energy Star': 0.04;
  'EPEAT': 0.06;
  'Rainforest Alliance': 0.05;
  'Fair Trade': 0.03;
}

export class EcoModulationEngine {
  private certificationBonuses: Record<string, number> = {
    'FSC': 0.05,
    'PEFC': 0.04,
    'Cradle to Cradle': 0.08,
    'GREENGUARD': 0.03,
    'Energy Star': 0.04,
    'EPEAT': 0.06,
    'Rainforest Alliance': 0.05,
    'Fair Trade': 0.03
  };

  calculateEcoModulation(
    material: EnhancedMaterial,
    baseFee: number,
    ecoFactors: EcoModulationFactors
  ): EcoModulationResult {
    const breakdown = {
      carbonFootprintAdjustment: this.calculateCarbonFootprintAdjustment(ecoFactors.carbonFootprint, baseFee),
      recycledContentBonus: this.calculateRecycledContentBonus(ecoFactors.recycledContent, baseFee),
      biodegradabilityBonus: this.calculateBiodegradabilityBonus(ecoFactors.biodegradability, baseFee),
      reusabilityBonus: this.calculateReusabilityBonus(ecoFactors.reusability, baseFee),
      localSourcingBonus: this.calculateLocalSourcingBonus(ecoFactors.localSourcing, baseFee),
      certificationBonus: this.calculateCertificationBonus(ecoFactors.certifications, baseFee)
    };

    const totalAdjustment = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
    const modulatedFee = Math.max(0, baseFee + totalAdjustment);
    const adjustmentPercentage = baseFee > 0 ? (totalAdjustment / baseFee) * 100 : 0;
    const sustainabilityScore = this.calculateSustainabilityScore(ecoFactors, breakdown);

    return {
      originalFee: baseFee,
      modulatedFee,
      totalAdjustment,
      adjustmentPercentage,
      breakdown,
      sustainabilityScore
    };
  }

  private calculateCarbonFootprintAdjustment(carbonFootprint: number, baseFee: number): number {
    // Carbon footprint: 0-10 scale, higher = worse (penalty), lower = better (bonus)
    // Neutral point at 5, penalty above, bonus below
    const normalizedScore = (carbonFootprint - 5) / 5; // -1 to 1 scale
    return -normalizedScore * baseFee * 0.15; // Up to 15% adjustment
  }

  private calculateRecycledContentBonus(recycledContent: number, baseFee: number): number {
    // Recycled content: 0-1 scale (0% to 100%)
    // Linear bonus up to 20% fee reduction
    return -recycledContent * baseFee * 0.20;
  }

  private calculateBiodegradabilityBonus(biodegradability: number, baseFee: number): number {
    // Biodegradability: 0-1 scale
    // Up to 10% bonus for fully biodegradable materials
    return -biodegradability * baseFee * 0.10;
  }

  private calculateReusabilityBonus(reusability: number, baseFee: number): number {
    // Reusability: 0-1 scale
    // Up to 25% bonus for highly reusable materials
    return -reusability * baseFee * 0.25;
  }

  private calculateLocalSourcingBonus(localSourcing: number, baseFee: number): number {
    // Local sourcing: 0-1 scale (0% to 100% local)
    // Up to 8% bonus for fully local sourcing
    return -localSourcing * baseFee * 0.08;
  }

  private calculateCertificationBonus(certifications: string[], baseFee: number): number {
    let totalBonus = 0;
    const maxBonus = baseFee * 0.15; // Cap at 15% total certification bonus

    for (const cert of certifications) {
      const bonus = this.certificationBonuses[cert] || 0;
      totalBonus += bonus;
    }

    // Apply diminishing returns and cap
    const effectiveBonus = Math.min(totalBonus, 0.15);
    return -effectiveBonus * baseFee;
  }

  private calculateSustainabilityScore(ecoFactors: EcoModulationFactors, breakdown: any): number {
    // Calculate overall sustainability score (0-100)
    const weights = {
      carbonFootprint: 0.25,
      recycledContent: 0.20,
      biodegradability: 0.15,
      reusability: 0.20,
      localSourcing: 0.10,
      certifications: 0.10
    };

    let score = 0;
    
    // Carbon footprint (inverted - lower is better)
    score += (10 - ecoFactors.carbonFootprint) * 10 * weights.carbonFootprint;
    
    // Other factors (higher is better)
    score += ecoFactors.recycledContent * 100 * weights.recycledContent;
    score += ecoFactors.biodegradability * 100 * weights.biodegradability;
    score += ecoFactors.reusability * 100 * weights.reusability;
    score += ecoFactors.localSourcing * 100 * weights.localSourcing;
    
    // Certifications
    const certScore = Math.min(ecoFactors.certifications.length * 20, 100);
    score += certScore * weights.certifications;

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  getSustainabilityRecommendations(ecoFactors: EcoModulationFactors): string[] {
    const recommendations: string[] = [];

    if (ecoFactors.carbonFootprint > 7) {
      recommendations.push('Consider materials with lower carbon footprint');
    }

    if (ecoFactors.recycledContent < 0.3) {
      recommendations.push('Increase recycled content to 30% or higher for better rates');
    }

    if (ecoFactors.biodegradability < 0.5) {
      recommendations.push('Explore biodegradable material alternatives');
    }

    if (ecoFactors.reusability < 0.3) {
      recommendations.push('Design for reusability to reduce fees');
    }

    if (ecoFactors.localSourcing < 0.5) {
      recommendations.push('Source materials locally to reduce transportation impact');
    }

    if (ecoFactors.certifications.length === 0) {
      recommendations.push('Obtain sustainability certifications (FSC, Cradle to Cradle, etc.)');
    }

    return recommendations;
  }
}

export const ecoModulationEngine = new EcoModulationEngine();
