from decimal import Decimal
from typing import Dict, Any, List, Optional
from .base_strategy import FeeCalculationStrategy


class ColoradoFeeCalculationStrategy(FeeCalculationStrategy):
    """
    Colorado EPR fee calculation strategy implementing 100% Municipal Reimbursement model.
    
    Key Features:
    - 100% Municipal Reimbursement (not direct fee-per-ton)
    - Calculate total net cost of statewide recycling system
    - Allocate costs to producers based on material type and amount
    - Eco-modulation for PCR content, reusability, and recycling disruption
    - Small producer exemption (<$5M revenue OR <1 ton materials)
    """
    
    def __init__(self):
        super().__init__("CO")
        
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Colorado EPR fees using 100% Municipal Reimbursement model.
        
        Colorado's unique calculation:
        1. Calculate total net cost of statewide recycling system
        2. Allocate costs to individual producers based on material type/amount
        3. Apply eco-modulation for sustainability factors
        4. Apply small producer exemptions
        """
        validation_errors = self.validate_producer_data(report_data.get('producer_data', {}))
        validation_errors.extend(self.validate_packaging_data(report_data.get('packaging_data', [])))
        
        if validation_errors:
            raise ValueError(f"Validation errors: {'; '.join(validation_errors)}")
            
        if self.is_small_producer(report_data.get('producer_data', {})):
            return self._apply_small_producer_exemption(report_data)
            
        total_system_cost = self._calculate_total_system_cost(report_data)
        producer_allocation = self._allocate_cost_to_producer(total_system_cost, report_data)
        
        eco_modulated_fee = self.apply_eco_modulation(producer_allocation, report_data)
        
        final_fee = self.apply_exemptions(eco_modulated_fee, report_data.get('producer_data', {}))
        
        return {
            "jurisdiction": "Colorado",
            "total_system_cost": total_system_cost,
            "producer_allocation": producer_allocation,
            "eco_modulated_fee": eco_modulated_fee,
            "final_fee": final_fee,
            "calculation_breakdown": {
                "reimbursement_model": "100% Municipal Reimbursement",
                "producer_tonnage_share": self._get_producer_tonnage_share(report_data),
                "eco_modulation_factors": self._get_eco_modulation_breakdown(report_data)
            }
        }
        
    def _calculate_total_system_cost(self, report_data: Dict[str, Any]) -> Decimal:
        """
        Calculate total net cost of statewide recycling system.
        
        This includes:
        - Municipal collection costs
        - Processing and sorting costs
        - Transportation costs
        - Administrative overhead
        - Infrastructure maintenance
        """
        
        system_data = report_data.get('system_data', {})
        
        collection_costs = Decimal(str(system_data.get('total_collection_costs', 50000000)))  # $50M baseline
        processing_costs = Decimal(str(system_data.get('total_processing_costs', 30000000)))  # $30M baseline
        transportation_costs = Decimal(str(system_data.get('total_transportation_costs', 15000000)))  # $15M baseline
        administrative_costs = Decimal(str(system_data.get('total_administrative_costs', 10000000)))  # $10M baseline
        infrastructure_costs = Decimal(str(system_data.get('total_infrastructure_costs', 20000000)))  # $20M baseline
        
        total_cost = (collection_costs + processing_costs + transportation_costs + 
                     administrative_costs + infrastructure_costs)
        
        material_revenue = Decimal(str(system_data.get('total_material_revenue', 5000000)))  # $5M baseline
        net_system_cost = total_cost - material_revenue
        
        if net_system_cost < Decimal('0'):
            net_system_cost = Decimal('0')
            
        return self.round_to_currency_precision(net_system_cost)
        
    def _allocate_cost_to_producer(self, total_cost: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Allocate total system cost to individual producer based on material type and amount.
        
        Colorado uses proportional allocation based on:
        - Producer's tonnage vs. system total tonnage
        - Material-specific cost factors
        - Geographic distribution factors
        """
        producer_tonnage = Decimal(str(report_data.get('total_tonnage', 0)))
        system_total_tonnage = Decimal(str(report_data.get('system_total_tonnage', 1)))
        
        if system_total_tonnage <= 0 or producer_tonnage <= 0:
            return Decimal('0')
            
        base_allocation_ratio = producer_tonnage / system_total_tonnage
        
        material_weighted_ratio = self._calculate_material_weighted_ratio(report_data, base_allocation_ratio)
        
        producer_allocation = total_cost * material_weighted_ratio
        
        return self.round_to_currency_precision(producer_allocation)
        
    def _calculate_material_weighted_ratio(self, report_data: Dict[str, Any], base_ratio: Decimal) -> Decimal:
        """
        Calculate material-weighted allocation ratio based on Colorado's cost factors.
        
        Different materials have different processing costs and recycling challenges.
        """
        packaging_data = report_data.get('packaging_data', [])
        total_weight = self._get_total_weight(packaging_data)
        
        if total_weight <= 0:
            return base_ratio
            
        material_cost_factors = {
            'plastic': Decimal('1.2'),      # 20% higher cost due to sorting complexity
            'glass': Decimal('0.8'),        # 20% lower cost due to simple processing
            'metal': Decimal('0.9'),        # 10% lower cost due to high value
            'paper': Decimal('0.7'),        # 30% lower cost due to established markets
            'cardboard': Decimal('0.6'),    # 40% lower cost due to high demand
            'foam': Decimal('2.0'),         # 100% higher cost due to processing challenges
            'composite': Decimal('1.8')     # 80% higher cost due to separation requirements
        }
        
        weighted_cost = Decimal('0')
        
        for component in packaging_data:
            material_type = component.get('material_type', '').lower()
            weight_per_unit = Decimal(str(component.get('weight_per_unit', 0)))
            weight_unit = component.get('weight_unit', 'kg')
            units_sold = Decimal(str(component.get('units_sold', 0)))
            
            weight_kg = self.standardize_weight_to_kg(weight_per_unit, weight_unit)
            component_weight = weight_kg * units_sold
            
            cost_factor = material_cost_factors.get(material_type, material_cost_factors['composite'])
            
            weight_ratio = component_weight / total_weight if total_weight > 0 else Decimal('0')
            weighted_cost += cost_factor * weight_ratio
            
        return base_ratio * weighted_cost
        
    def apply_eco_modulation(self, base_fee: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Apply Colorado's eco-modulation rules.
        
        Colorado focuses on:
        - PCR (Post-Consumer Recycled) content bonuses
        - Reusability bonuses
        - Recycling disruption penalties
        - Design for recyclability bonuses/penalties
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
            
            pcr_percentage = Decimal(str(component.get('recycled_content_percentage', 0))) / Decimal('100')
            if pcr_percentage > Decimal('0.25'):  # >25% PCR content
                pcr_bonus = base_fee * weight_ratio * pcr_percentage * Decimal('0.20')  # Up to 20% bonus
                total_adjustment -= pcr_bonus
                
            if component.get('reusable', False):
                reusability_bonus = base_fee * weight_ratio * Decimal('0.30')  # 30% bonus
                total_adjustment -= reusability_bonus
                
            if component.get('disrupts_recycling', False):
                disruption_penalty = base_fee * weight_ratio * Decimal('0.50')  # 50% penalty
                total_adjustment += disruption_penalty
                
            recyclability_score = Decimal(str(component.get('recyclability_score', 50))) / Decimal('100')  # 0-100 scale
            if recyclability_score > Decimal('0.80'):  # >80% recyclability
                design_bonus = base_fee * weight_ratio * Decimal('0.15')  # 15% bonus
                total_adjustment -= design_bonus
            elif recyclability_score < Decimal('0.30'):  # <30% recyclability
                design_penalty = base_fee * weight_ratio * Decimal('0.40')  # 40% penalty
                total_adjustment += design_penalty
                
            material_type = component.get('material_type', '').lower()
            if material_type in ['foam', 'polystyrene']:
                foam_penalty = base_fee * weight_ratio * Decimal('0.25')  # 25% penalty
                total_adjustment += foam_penalty
                
        modulated_fee = base_fee + total_adjustment
        
        if modulated_fee < Decimal('0'):
            modulated_fee = Decimal('0')
            
        return self.round_to_currency_precision(modulated_fee)
        
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """Apply Colorado-specific exemptions beyond small producer exemption."""
        return fee
        
    def get_small_producer_thresholds(self) -> Dict[str, Optional[Decimal]]:
        """Return Colorado's small producer thresholds."""
        return {
            'revenue_threshold': Decimal('5000000'),  # $5M gross revenue
            'tonnage_threshold': Decimal('1.0')       # 1 ton of covered materials
        }
        
    def _apply_small_producer_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Colorado's small producer exemption (zero fee)."""
        return {
            "jurisdiction": "Colorado",
            "fee_type": "small_producer_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": "Revenue < $5M OR tonnage < 1 ton"
            }
        }
        
    def _get_producer_tonnage_share(self, report_data: Dict[str, Any]) -> Decimal:
        """Calculate producer's share of total system tonnage."""
        producer_tonnage = Decimal(str(report_data.get('total_tonnage', 0)))
        system_total_tonnage = Decimal(str(report_data.get('system_total_tonnage', 1)))
        
        if system_total_tonnage > 0:
            return self.round_to_currency_precision(producer_tonnage / system_total_tonnage * Decimal('100'))
        
        return Decimal('0')
        
    def _get_eco_modulation_breakdown(self, report_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get breakdown of eco-modulation factors applied."""
        packaging_data = report_data.get('packaging_data', [])
        breakdown = []
        
        for i, component in enumerate(packaging_data):
            factors = []
            
            pcr_percentage = Decimal(str(component.get('recycled_content_percentage', 0)))
            if pcr_percentage > 25:
                factors.append(f"PCR Content Bonus: {pcr_percentage}%")
                
            if component.get('reusable', False):
                factors.append("Reusability Bonus: 30%")
                
            if component.get('disrupts_recycling', False):
                factors.append("Recycling Disruption Penalty: 50%")
                
            recyclability_score = Decimal(str(component.get('recyclability_score', 50)))
            if recyclability_score > 80:
                factors.append(f"High Recyclability Bonus: {recyclability_score}%")
            elif recyclability_score < 30:
                factors.append(f"Low Recyclability Penalty: {recyclability_score}%")
                
            material_type = component.get('material_type', '').lower()
            if material_type in ['foam', 'polystyrene']:
                factors.append("Problematic Material Penalty: 25%")
                
            breakdown.append({
                "component_index": i,
                "material_type": material_type,
                "eco_factors": factors
            })
            
        return breakdown
        
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
