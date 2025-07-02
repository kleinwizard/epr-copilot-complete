from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime
from .base_strategy import FeeCalculationStrategy


class OregonFeeCalculationStrategy(FeeCalculationStrategy):
    """
    Oregon EPR fee calculation strategy implementing PRO-led fee system
    with sophisticated eco-modulation and processor compensation.
    
    Key Features:
    - Three-tiered bonus system (LCA disclosure, impact reduction, reusable packaging)
    - Processor pass-through costs (Commodity Risk + Contamination Management)
    - Small producer exemptions (<$5M revenue AND <1 metric ton)
    - Low-volume flat fee option (<$10M revenue OR <5 metric tons)
    """
    
    def __init__(self):
        super().__init__("OR")
        
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Oregon EPR fees using the full calculation pipeline.
        
        Oregon's unique calculation includes:
        1. Base fee calculation
        2. Eco-modulation bonuses (A, B, C tiers)
        3. Processor pass-through costs
        4. Small producer exemptions
        """
        validation_errors = self.validate_producer_data(report_data.get('producer_data', {}))
        validation_errors.extend(self.validate_packaging_data(report_data.get('packaging_data', [])))
        
        if validation_errors:
            raise ValueError(f"Validation errors: {'; '.join(validation_errors)}")
            
        if self.is_small_producer(report_data.get('producer_data', {})):
            return self._apply_small_producer_exemption(report_data)
            
        if self._qualifies_for_low_volume_fee(report_data.get('producer_data', {})):
            return self._calculate_low_volume_flat_fee(report_data)
            
        base_fee = self._calculate_base_fee(report_data)
        
        eco_modulated_fee = self.apply_eco_modulation(base_fee, report_data)
        
        processor_costs = self._calculate_processor_costs(report_data)
        
        final_fee = self.apply_exemptions(eco_modulated_fee + processor_costs['total'], report_data.get('producer_data', {}))
        
        return {
            "jurisdiction": "Oregon",
            "base_fee": base_fee,
            "eco_modulated_fee": eco_modulated_fee,
            "processor_costs": processor_costs,
            "final_fee": final_fee,
            "calculation_breakdown": {
                "commodity_risk_fee": processor_costs.get('commodity_risk_fee', Decimal('0')),
                "contamination_management_fee": processor_costs.get('contamination_management_fee', Decimal('0')),
                "lca_bonuses_applied": self._get_applied_bonuses(report_data)
            }
        }
        
    def _calculate_base_fee(self, report_data: Dict[str, Any]) -> Decimal:
        """Calculate base fee using Oregon material rates."""
        packaging_data = report_data.get('packaging_data', [])
        total_fee = Decimal('0')
        
        oregon_rates = {
            'plastic': Decimal('0.2646'),  # $0.12/lb * 2.205 lb/kg
            'glass': Decimal('0.1764'),    # $0.08/lb * 2.205 lb/kg
            'metal': Decimal('0.3308'),    # $0.15/lb * 2.205 lb/kg
            'paper': Decimal('0.1102'),    # $0.05/lb * 2.205 lb/kg
            'cardboard': Decimal('0.0882'), # $0.04/lb * 2.205 lb/kg
            'foam': Decimal('0.4410'),     # $0.20/lb * 2.205 lb/kg
            'composite': Decimal('0.3969') # $0.18/lb * 2.205 lb/kg
        }
        
        for component in packaging_data:
            material_type = component.get('material_type', '').lower()
            weight_per_unit = Decimal(str(component.get('weight_per_unit', 0)))
            weight_unit = component.get('weight_unit', 'kg')
            units_sold = Decimal(str(component.get('units_sold', 0)))
            
            weight_kg = self.standardize_weight_to_kg(weight_per_unit, weight_unit)
            total_weight_kg = weight_kg * units_sold
            
            rate = oregon_rates.get(material_type, oregon_rates['composite'])
            
            component_fee = total_weight_kg * rate
            total_fee += component_fee
            
        return self.round_to_currency_precision(total_fee)
        
    def apply_eco_modulation(self, base_fee: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Apply Oregon's three-tiered bonus system for eco-modulation.
        
        Bonus A: LCA disclosure (5% discount)
        Bonus B: Environmental impact reduction via LCA (10% discount)
        Bonus C: Reusable/refillable packaging systems (15% discount)
        
        Bonuses are cumulative but capped at 25% total discount.
        """
        producer_data = report_data.get('producer_data', {})
        modulated_fee = base_fee
        total_discount = Decimal('0')
        
        if producer_data.get('has_lca_disclosure', False):
            bonus_a_discount = base_fee * Decimal('0.05')
            total_discount += bonus_a_discount
            
        if producer_data.get('has_environmental_impact_reduction', False):
            bonus_b_discount = base_fee * Decimal('0.10')
            total_discount += bonus_b_discount
            
        if producer_data.get('uses_reusable_packaging', False):
            bonus_c_discount = base_fee * Decimal('0.15')
            total_discount += bonus_c_discount
            
        max_discount = base_fee * Decimal('0.25')
        if total_discount > max_discount:
            total_discount = max_discount
            
        modulated_fee = base_fee - total_discount
        return self.round_to_currency_precision(modulated_fee)
        
    def _calculate_processor_costs(self, report_data: Dict[str, Any]) -> Dict[str, Decimal]:
        """
        Calculate Oregon processor pass-through costs.
        
        Includes:
        1. Commodity Risk Fee: (Fee Rate - Average Commodity Value) * Eligible Tons
        2. Contamination Management Fee: Fee Rate * Eligible Tons * 0.467
        """
        eligible_tons = Decimal(str(report_data.get('eligible_tons', 0)))
        year = report_data.get('year', datetime.now().year)
        avg_commodity_value = Decimal(str(report_data.get('avg_commodity_value', 0)))
        
        commodity_fee_rate = self._get_commodity_fee_rate(year)
        commodity_risk_fee = (commodity_fee_rate - avg_commodity_value) * eligible_tons
        
        if commodity_risk_fee < Decimal('0'):
            commodity_risk_fee = Decimal('0')
            
        contamination_fee_rate = self._get_contamination_fee_rate(year)
        contamination_fee = contamination_fee_rate * eligible_tons * Decimal('0.467')
        
        total_processor_costs = commodity_risk_fee + contamination_fee
        
        return {
            'commodity_risk_fee': self.round_to_currency_precision(commodity_risk_fee),
            'contamination_management_fee': self.round_to_currency_precision(contamination_fee),
            'total': self.round_to_currency_precision(total_processor_costs)
        }
        
    def _get_commodity_fee_rate(self, year: int) -> Decimal:
        """Get commodity fee rate based on year ($/ton)."""
        if year in [2025, 2026]:
            return Decimal('200')
        elif year == 2027:
            return Decimal('286')
        else:  # 2028+
            return Decimal('245')
            
    def _get_contamination_fee_rate(self, year: int) -> Decimal:
        """Get contamination management fee rate based on year ($/ton)."""
        if year in [2025, 2026]:
            return Decimal('341')
        elif year == 2027:
            return Decimal('432')
        else:  # 2028+
            return Decimal('418')
            
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """Apply Oregon-specific exemptions beyond small producer exemption."""
        return fee
        
    def get_small_producer_thresholds(self) -> Dict[str, Optional[Decimal]]:
        """Return Oregon's small producer thresholds."""
        return {
            'revenue_threshold': Decimal('5000000'),  # $5M
            'tonnage_threshold': Decimal('1.0')       # 1 metric ton
        }
        
    def _qualifies_for_low_volume_fee(self, producer_data: Dict[str, Any]) -> bool:
        """
        Check if producer qualifies for Oregon's low-volume flat fee option.
        
        Qualifies if: revenue < $10M OR tonnage < 5 metric tons
        """
        annual_revenue = Decimal(str(producer_data.get('annual_revenue', 0)))
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        
        revenue_qualifies = annual_revenue < Decimal('10000000')  # $10M
        tonnage_qualifies = annual_tonnage < Decimal('5.0')       # 5 metric tons
        
        return revenue_qualifies or tonnage_qualifies
        
    def _calculate_low_volume_flat_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Oregon's tiered uniform fee for low-volume producers.
        
        Fee tiers between $700 and $4,400 based on volume.
        """
        producer_data = report_data.get('producer_data', {})
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        
        if annual_tonnage < Decimal('1.0'):
            flat_fee = Decimal('700')
        elif annual_tonnage < Decimal('2.0'):
            flat_fee = Decimal('1400')
        elif annual_tonnage < Decimal('3.0'):
            flat_fee = Decimal('2200')
        elif annual_tonnage < Decimal('4.0'):
            flat_fee = Decimal('3200')
        else:  # < 5.0 tons
            flat_fee = Decimal('4400')
            
        return {
            "jurisdiction": "Oregon",
            "fee_type": "low_volume_flat_fee",
            "annual_tonnage": annual_tonnage,
            "flat_fee": flat_fee,
            "final_fee": flat_fee,
            "calculation_breakdown": {
                "fee_tier": f"Tier for {annual_tonnage} metric tons"
            }
        }
        
    def _apply_small_producer_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Oregon's small producer exemption (zero fee)."""
        return {
            "jurisdiction": "Oregon",
            "fee_type": "small_producer_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": "Revenue < $5M AND tonnage < 1 metric ton"
            }
        }
        
    def _get_applied_bonuses(self, report_data: Dict[str, Any]) -> List[str]:
        """Get list of eco-modulation bonuses applied."""
        producer_data = report_data.get('producer_data', {})
        bonuses = []
        
        if producer_data.get('has_lca_disclosure', False):
            bonuses.append("Bonus A: LCA Disclosure (5%)")
            
        if producer_data.get('has_environmental_impact_reduction', False):
            bonuses.append("Bonus B: Environmental Impact Reduction (10%)")
            
        if producer_data.get('uses_reusable_packaging', False):
            bonuses.append("Bonus C: Reusable/Refillable Packaging (15%)")
            
        return bonuses
