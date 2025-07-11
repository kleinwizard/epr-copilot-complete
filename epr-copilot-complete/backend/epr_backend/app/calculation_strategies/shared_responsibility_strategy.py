from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime
from .base_strategy import FeeCalculationStrategy


class SharedResponsibilityStrategy(FeeCalculationStrategy):
    """
    Shared Responsibility EPR fee calculation strategy for Maryland, Minnesota, and Washington.
    
    These three states use a "Shared Responsibility" model with phased-in funding requirements.
    The calculation logic is date-aware to apply the correct funding percentage.
    
    Key Features:
    - Phased-in funding percentages that increase over time
    - Date-aware calculations based on effective dates
    - Washington's unique 65%/70% reuse/recycling rate exemption
    - Different small producer thresholds per state
    """
    
    def __init__(self, state_code: str):
        """
        Initialize strategy for specific state.
        
        Args:
            state_code: "MD", "MN", or "WA"
        """
        if state_code not in ["MD", "MN", "WA"]:
            raise ValueError(f"SharedResponsibilityStrategy only supports MD, MN, WA. Got: {state_code}")
            
        super().__init__(state_code)
        self.state_code = state_code
        
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Shared Responsibility EPR fees with phased-in funding percentages.
        
        The calculation pipeline:
        1. Calculate total program costs for the state
        2. Determine current funding percentage based on date
        3. Calculate producer responsibility portion
        4. Allocate to individual producer based on packaging
        5. Apply eco-modulation and exemptions
        """
        validation_errors = self.validate_producer_data(report_data.get('producer_data', {}))
        validation_errors.extend(self.validate_packaging_data(report_data.get('packaging_data', [])))
        
        if validation_errors:
            raise ValueError(f"Validation errors: {'; '.join(validation_errors)}")
            
        exemption_result = self._check_exemptions(report_data)
        if exemption_result:
            return exemption_result
            
        total_program_cost = self._calculate_total_program_cost(report_data)
        current_funding_percentage = self._get_current_funding_percentage(report_data.get('calculation_date'))
        producer_responsibility_cost = total_program_cost * current_funding_percentage
        producer_allocation = self._allocate_cost_to_producer(producer_responsibility_cost, report_data)
        
        eco_modulated_fee = self.apply_eco_modulation(producer_allocation, report_data)
        
        final_fee = self.apply_exemptions(eco_modulated_fee, report_data.get('producer_data', {}))
        
        return {
            "jurisdiction": self._get_state_name(),
            "total_program_cost": total_program_cost,
            "funding_percentage": current_funding_percentage,
            "producer_responsibility_cost": producer_responsibility_cost,
            "producer_allocation": producer_allocation,
            "eco_modulated_fee": eco_modulated_fee,
            "final_fee": final_fee,
            "calculation_breakdown": {
                "model": "Shared Responsibility",
                "funding_phase": self._get_funding_phase_description(report_data.get('calculation_date')),
                "state_specific_factors": self._get_state_specific_breakdown(report_data)
            }
        }
        
    def _calculate_total_program_cost(self, report_data: Dict[str, Any]) -> Decimal:
        """
        Calculate total program cost for the state.
        
        This includes municipal support, infrastructure, administration, and education costs.
        """
        system_data = report_data.get('system_data', {})
        
        municipal_support_costs = Decimal(str(system_data.get('municipal_support_costs', 40000000)))  # $40M baseline
        infrastructure_costs = Decimal(str(system_data.get('infrastructure_costs', 25000000)))        # $25M baseline
        administrative_costs = Decimal(str(system_data.get('administrative_costs', 15000000)))        # $15M baseline
        education_outreach_costs = Decimal(str(system_data.get('education_outreach_costs', 10000000))) # $10M baseline
        
        state_multiplier = self._get_state_cost_multiplier()
        
        total_cost = (municipal_support_costs + infrastructure_costs + 
                     administrative_costs + education_outreach_costs) * state_multiplier
        
        return self.round_to_currency_precision(total_cost)
        
    def _get_state_cost_multiplier(self) -> Decimal:
        """Get state-specific cost multiplier based on population and geography."""
        multipliers = {
            'MD': Decimal('0.85'),  # Smaller, more densely populated
            'MN': Decimal('1.0'),   # Baseline
            'WA': Decimal('1.2')    # Larger, more geographically diverse
        }
        return multipliers.get(self.state_code, Decimal('1.0'))
        
    def _get_current_funding_percentage(self, calculation_date: Optional[str] = None) -> Decimal:
        """
        Get current funding percentage based on phased-in schedule.
        
        Phased-In Funding Percentages:
        - Maryland: 50% by July 2028 -> 75% by July 2029 -> 90% by July 2030
        - Minnesota: 50% by Feb 2029 -> 75% by Feb 2030 -> 90% by Feb 2031  
        - Washington: 50% by Feb 2030 -> 75% by Feb 2031 -> 90% by Feb 2032
        """
        if calculation_date:
            calc_date = datetime.fromisoformat(calculation_date.replace('Z', '+00:00'))
        else:
            calc_date = datetime.now()
            
        if self.state_code == 'MD':
            if calc_date >= datetime(2030, 7, 1):
                return Decimal('0.90')  # 90%
            elif calc_date >= datetime(2029, 7, 1):
                return Decimal('0.75')  # 75%
            elif calc_date >= datetime(2028, 7, 1):
                return Decimal('0.50')  # 50%
            else:
                return Decimal('0.00')  # Not yet effective
                
        elif self.state_code == 'MN':
            if calc_date >= datetime(2031, 2, 1):
                return Decimal('0.90')  # 90%
            elif calc_date >= datetime(2030, 2, 1):
                return Decimal('0.75')  # 75%
            elif calc_date >= datetime(2029, 2, 1):
                return Decimal('0.50')  # 50%
            else:
                return Decimal('0.00')  # Not yet effective
                
        elif self.state_code == 'WA':
            if calc_date >= datetime(2032, 2, 1):
                return Decimal('0.90')  # 90%
            elif calc_date >= datetime(2031, 2, 1):
                return Decimal('0.75')  # 75%
            elif calc_date >= datetime(2030, 2, 1):
                return Decimal('0.50')  # 50%
            else:
                return Decimal('0.00')  # Not yet effective
                
        return Decimal('0.00')
        
    def _allocate_cost_to_producer(self, total_cost: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Allocate total cost to individual producer based on packaging tonnage.
        """
        producer_tonnage = Decimal(str(report_data.get('total_tonnage', 0)))
        system_total_tonnage = Decimal(str(report_data.get('system_total_tonnage', 1)))
        
        if system_total_tonnage <= 0 or producer_tonnage <= 0:
            return Decimal('0')
            
        allocation_ratio = producer_tonnage / system_total_tonnage
        producer_allocation = total_cost * allocation_ratio
        
        return self.round_to_currency_precision(producer_allocation)
        
    def apply_eco_modulation(self, base_fee: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Apply shared responsibility eco-modulation rules.
        
        Common factors across MD, MN, WA:
        - Post-consumer recycled content bonuses
        - Design for recyclability bonuses/penalties
        - Reusability bonuses
        - Material-specific adjustments
        """
        packaging_data = report_data.get('packaging_data', [])
        modulated_fee = base_fee
        total_adjustment = Decimal('0')
        total_weight = self._get_total_weight(packaging_data)
        
        if total_weight <= 0:
            return modulated_fee
            
        for component in packaging_data:
            component_weight = self._get_component_weight(component)
            weight_ratio = component_weight / total_weight
            component_base_fee = base_fee * weight_ratio
            
            pcr_percentage = Decimal(str(component.get('recycled_content_percentage', 0))) / Decimal('100')
            if pcr_percentage > Decimal('0.30'):  # >30% PCR content
                pcr_bonus = component_base_fee * pcr_percentage * Decimal('0.25')  # Up to 25% bonus
                total_adjustment -= pcr_bonus
                
            recyclability_score = Decimal(str(component.get('recyclability_score', 50))) / Decimal('100')
            if recyclability_score > Decimal('0.85'):  # >85% recyclable
                design_bonus = component_base_fee * Decimal('0.20')  # 20% bonus
                total_adjustment -= design_bonus
            elif recyclability_score < Decimal('0.40'):  # <40% recyclable
                design_penalty = component_base_fee * Decimal('0.35')  # 35% penalty
                total_adjustment += design_penalty
                
            if component.get('reusable', False):
                reusability_bonus = component_base_fee * Decimal('0.25')  # 25% bonus
                total_adjustment -= reusability_bonus
                
            material_type = component.get('material_type', '').lower()
            if material_type in ['foam', 'polystyrene']:
                material_penalty = component_base_fee * Decimal('0.30')  # 30% penalty
                total_adjustment += material_penalty
            elif material_type in ['paper', 'cardboard']:
                material_bonus = component_base_fee * Decimal('0.10')  # 10% bonus
                total_adjustment -= material_bonus
                
            state_adjustment = self._apply_state_specific_eco_modulation(component_base_fee, component)
            total_adjustment += state_adjustment
            
        modulated_fee = base_fee + total_adjustment
        
        if modulated_fee < Decimal('0'):
            modulated_fee = Decimal('0')
            
        return self.round_to_currency_precision(modulated_fee)
        
    def _apply_state_specific_eco_modulation(self, component_fee: Decimal, component: Dict[str, Any]) -> Decimal:
        """Apply state-specific eco-modulation rules."""
        adjustment = Decimal('0')
        
        if self.state_code == 'WA':
            if component.get('marine_degradable', False):
                adjustment -= component_fee * Decimal('0.15')  # 15% bonus
                
            if component.get('harmful_to_marine_life', False):
                adjustment += component_fee * Decimal('0.40')  # 40% penalty
                
        elif self.state_code == 'MD':
            if component.get('bay_friendly', False):
                adjustment -= component_fee * Decimal('0.12')  # 12% bonus
                
        elif self.state_code == 'MN':
            if component.get('cold_weather_stable', False):
                adjustment -= component_fee * Decimal('0.08')  # 8% bonus
                
        return adjustment
        
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """Apply state-specific exemptions beyond small producer exemption."""
        if self.state_code == 'WA':
            return self._apply_washington_recycling_rate_exemption(fee, producer_data)
            
        return fee
        
    def _apply_washington_recycling_rate_exemption(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """
        Apply Washington's unique exemption for high reuse/recycling rates.
        
        A material type can be exempted if it achieves:
        - 65% reuse/recycling rate for 3 consecutive years (before 2030)
        - 70% reuse/recycling rate for 3 consecutive years (2030+)
        """
        current_year = datetime.now().year
        threshold = Decimal('0.70') if current_year >= 2030 else Decimal('0.65')
        
        recycling_rates = producer_data.get('annual_recycling_rates', [])
        
        if len(recycling_rates) >= 3:
            recent_rates = recycling_rates[-3:]
            all_above_threshold = all(
                Decimal(str(rate)) >= threshold for rate in recent_rates
            )
            
            if all_above_threshold:
                exemption_discount = fee * Decimal('0.80')  # 80% discount
                return fee - exemption_discount
                
        return fee
        
    def get_small_producer_thresholds(self) -> Dict[str, Optional[Decimal]]:
        """Return state-specific small producer thresholds."""
        thresholds = {
            'MD': {
                'revenue_threshold': Decimal('1000000'),  # $1M global revenue
                'tonnage_threshold': None                 # No tonnage threshold for MD
            },
            'MN': {
                'revenue_threshold': Decimal('2000000'),  # $2M global revenue
                'tonnage_threshold': None                 # No tonnage threshold for MN
            },
            'WA': {
                'revenue_threshold': Decimal('5000000'),  # $5M global revenue
                'tonnage_threshold': None                 # No tonnage threshold for WA
            }
        }
        
        return thresholds.get(self.state_code, {
            'revenue_threshold': None,
            'tonnage_threshold': None
        })
        
    def _check_exemptions(self, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check all exemption categories for the state."""
        producer_data = report_data.get('producer_data', {})
        
        if self.is_small_producer(producer_data):
            return self._apply_small_producer_exemption(report_data)
            
        return None
        
    def _apply_small_producer_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply state-specific small producer exemption (zero fee)."""
        thresholds = self.get_small_producer_thresholds()
        
        exemption_reason = []
        if thresholds.get('revenue_threshold'):
            exemption_reason.append(f"Revenue < ${thresholds['revenue_threshold']:,.0f}")
        if thresholds.get('tonnage_threshold'):
            exemption_reason.append(f"Tonnage < {thresholds['tonnage_threshold']} ton")
            
        return {
            "jurisdiction": self._get_state_name(),
            "fee_type": "small_producer_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": " OR ".join(exemption_reason) if exemption_reason else "Small producer exemption"
            }
        }
        
    def _get_state_name(self) -> str:
        """Get full state name from code."""
        names = {
            'MD': 'Maryland',
            'MN': 'Minnesota', 
            'WA': 'Washington'
        }
        return names.get(self.state_code, self.state_code)
        
    def _get_funding_phase_description(self, calculation_date: Optional[str] = None) -> str:
        """Get description of current funding phase."""
        percentage = self._get_current_funding_percentage(calculation_date)
        
        if percentage == Decimal('0.00'):
            return "Pre-implementation phase (0% producer responsibility)"
        elif percentage == Decimal('0.50'):
            return "Phase 1: 50% producer responsibility"
        elif percentage == Decimal('0.75'):
            return "Phase 2: 75% producer responsibility"
        elif percentage == Decimal('0.90'):
            return "Phase 3: 90% producer responsibility"
        else:
            return f"Custom phase: {float(percentage * 100):.1f}% producer responsibility"
            
    def _get_state_specific_breakdown(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get state-specific calculation factors for audit trail."""
        breakdown = {
            "state_code": self.state_code,
            "cost_multiplier": float(self._get_state_cost_multiplier())
        }
        
        if self.state_code == 'WA':
            producer_data = report_data.get('producer_data', {})
            recycling_rates = producer_data.get('annual_recycling_rates', [])
            if recycling_rates:
                breakdown["recent_recycling_rates"] = recycling_rates[-3:]
                breakdown["qualifies_for_recycling_exemption"] = self._check_recycling_rate_qualification(producer_data)
                
        return breakdown
        
    def _check_recycling_rate_qualification(self, producer_data: Dict[str, Any]) -> bool:
        """Check if producer qualifies for Washington's recycling rate exemption."""
        current_year = datetime.now().year
        threshold = Decimal('0.70') if current_year >= 2030 else Decimal('0.65')
        
        recycling_rates = producer_data.get('annual_recycling_rates', [])
        
        if len(recycling_rates) >= 3:
            recent_rates = recycling_rates[-3:]
            return all(Decimal(str(rate)) >= threshold for rate in recent_rates)
            
        return False
        
    def _get_component_weight(self, component: Dict[str, Any]) -> Decimal:
        """Calculate total weight for a packaging component."""
        weight_per_unit = Decimal(str(component.get('weight_per_unit', 0)))
        weight_unit = component.get('weight_unit', 'kg')
        units_sold = Decimal(str(component.get('units_sold', 0)))
        
        weight_kg = self.standardize_weight_to_kg(weight_per_unit, weight_unit)
        return weight_kg * units_sold
        
    def _get_total_weight(self, packaging_data: List[Dict[str, Any]]) -> Decimal:
        """Calculate total weight across all packaging components."""
        total_weight = Decimal('0')
        
        for component in packaging_data:
            total_weight += self._get_component_weight(component)
            
        return total_weight


class MarylandFeeCalculationStrategy(SharedResponsibilityStrategy):
    """Maryland-specific EPR fee calculation strategy."""
    
    def __init__(self):
        super().__init__("MD")


class MinnesotaFeeCalculationStrategy(SharedResponsibilityStrategy):
    """Minnesota-specific EPR fee calculation strategy."""
    
    def __init__(self):
        super().__init__("MN")


class WashingtonFeeCalculationStrategy(SharedResponsibilityStrategy):
    """Washington-specific EPR fee calculation strategy."""
    
    def __init__(self):
        super().__init__("WA")
