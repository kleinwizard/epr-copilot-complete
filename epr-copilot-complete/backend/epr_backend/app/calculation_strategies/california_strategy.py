from decimal import Decimal
from typing import Dict, Any, List
from datetime import datetime
from .base_strategy import FeeCalculationStrategy


class CaliforniaFeeCalculationStrategy(FeeCalculationStrategy):
    """
    California EPR fee calculation strategy implementing PRO-led fee system
    with hierarchical CMC material classification and $500M Plastic Pollution Mitigation Fund.
    
    Key Features:
    - Hierarchical CMC (Covered Material Category) structure: Class > Type > Form
    - $500M/year Plastic Pollution Mitigation Fund allocation (starting 2027)
    - Small producer exemption (<$1M annual gross sales in California)
    - Plastic component distinction for fee calculation
    """
    
    def __init__(self):
        super().__init__("CA")
        
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate California EPR fees using the full calculation pipeline.
        
        California's unique calculation includes:
        1. Base fee calculation using CMC hierarchy
        2. Eco-modulation based on recyclability and plastic content
        3. Plastic Pollution Mitigation Fund allocation
        4. Small producer exemptions
        """
        validation_errors = self.validate_producer_data(report_data.get('producer_data', {}))
        validation_errors.extend(self.validate_packaging_data(report_data.get('packaging_data', [])))
        
        if validation_errors:
            raise ValueError(f"Validation errors: {'; '.join(validation_errors)}")
            
        if self.is_small_producer(report_data.get('producer_data', {})):
            return self._apply_small_producer_exemption(report_data)
            
        base_fee = self._calculate_base_fee_cmc(report_data)
        
        eco_modulated_fee = self.apply_eco_modulation(base_fee, report_data)
        
        pollution_fund_fee = self._calculate_pollution_fund_allocation(report_data)
        
        final_fee = self.apply_exemptions(eco_modulated_fee + pollution_fund_fee, report_data.get('producer_data', {}))
        
        return {
            "jurisdiction": "California",
            "base_fee": base_fee,
            "eco_modulated_fee": eco_modulated_fee,
            "pollution_fund_fee": pollution_fund_fee,
            "final_fee": final_fee,
            "calculation_breakdown": {
                "cmc_classifications": self._get_cmc_breakdown(report_data),
                "plastic_fund_applicable": pollution_fund_fee > Decimal('0'),
                "fund_allocation_year": report_data.get('year', datetime.now().year)
            }
        }
        
    def _calculate_base_fee_cmc(self, report_data: Dict[str, Any]) -> Decimal:
        """
        Calculate base fee using California's CMC (Covered Material Category) list.
        
        CMC Hierarchy: Class > Type > Form
        Example: Plastic > PET (#1) > Thermoformed Containers
        """
        packaging_data = report_data.get('packaging_data', [])
        total_fee = Decimal('0')
        
        california_cmc_rates = {
            'plastic_pet_bottles': Decimal('0.3308'),      # $0.15/lb * 2.205 lb/kg
            'plastic_pet_containers': Decimal('0.2866'),   # $0.13/lb * 2.205 lb/kg
            'plastic_hdpe_bottles': Decimal('0.2646'),     # $0.12/lb * 2.205 lb/kg
            'plastic_hdpe_containers': Decimal('0.2425'),  # $0.11/lb * 2.205 lb/kg
            'plastic_pp_containers': Decimal('0.2866'),    # $0.13/lb * 2.205 lb/kg
            'plastic_ps_containers': Decimal('0.4410'),    # $0.20/lb * 2.205 lb/kg (higher due to recycling challenges)
            'plastic_film': Decimal('0.1984'),             # $0.09/lb * 2.205 lb/kg
            'plastic_other': Decimal('0.5512'),            # $0.25/lb * 2.205 lb/kg (penalty for non-recyclable)
            
            'paper_corrugated': Decimal('0.0882'),         # $0.04/lb * 2.205 lb/kg
            'paper_paperboard': Decimal('0.1102'),         # $0.05/lb * 2.205 lb/kg
            'paper_mixed': Decimal('0.1323'),              # $0.06/lb * 2.205 lb/kg
            'paper_coated': Decimal('0.1764'),             # $0.08/lb * 2.205 lb/kg (plastic coating penalty)
            
            'glass_clear': Decimal('0.1543'),              # $0.07/lb * 2.205 lb/kg
            'glass_colored': Decimal('0.1764'),            # $0.08/lb * 2.205 lb/kg
            'glass_mixed': Decimal('0.1984'),              # $0.09/lb * 2.205 lb/kg
            
            'metal_aluminum_cans': Decimal('0.2205'),      # $0.10/lb * 2.205 lb/kg
            'metal_aluminum_other': Decimal('0.2646'),     # $0.12/lb * 2.205 lb/kg
            'metal_steel_cans': Decimal('0.2866'),         # $0.13/lb * 2.205 lb/kg
            'metal_steel_other': Decimal('0.3308'),        # $0.15/lb * 2.205 lb/kg
            
            'composite_paper_plastic': Decimal('0.4410'),  # $0.20/lb * 2.205 lb/kg
            'composite_metal_plastic': Decimal('0.4851'),  # $0.22/lb * 2.205 lb/kg
            'composite_other': Decimal('0.5512')           # $0.25/lb * 2.205 lb/kg
        }
        
        for component in packaging_data:
            cmc_category = self._map_to_cmc_category(component)
            
            weight_per_unit = Decimal(str(component.get('weight_per_unit', 0)))
            weight_unit = component.get('weight_unit', 'kg')
            units_sold = Decimal(str(component.get('units_sold', 0)))
            
            weight_kg = self.standardize_weight_to_kg(weight_per_unit, weight_unit)
            total_weight_kg = weight_kg * units_sold
            
            rate = california_cmc_rates.get(cmc_category, california_cmc_rates['composite_other'])
            
            component_fee = total_weight_kg * rate
            total_fee += component_fee
            
        return self.round_to_currency_precision(total_fee)
        
    def _map_to_cmc_category(self, component: Dict[str, Any]) -> str:
        """
        Map packaging component to California CMC category.
        
        This implements the hierarchical mapping: Class > Type > Form
        """
        material_type = component.get('material_type', '').lower()
        component_form = component.get('component_form', '').lower()
        has_plastic_component = component.get('contains_plastic', False)
        
        if 'plastic' in material_type or 'pet' in material_type:
            if 'bottle' in component_form:
                return 'plastic_pet_bottles'
            elif 'container' in component_form:
                return 'plastic_pet_containers'
            else:
                return 'plastic_other'
                
        elif 'hdpe' in material_type:
            if 'bottle' in component_form:
                return 'plastic_hdpe_bottles'
            else:
                return 'plastic_hdpe_containers'
                
        elif 'pp' in material_type or 'polypropylene' in material_type:
            return 'plastic_pp_containers'
            
        elif 'ps' in material_type or 'polystyrene' in material_type:
            return 'plastic_ps_containers'
            
        elif 'film' in material_type or 'wrap' in material_type:
            return 'plastic_film'
            
        elif 'paper' in material_type or 'cardboard' in material_type:
            if 'corrugated' in component_form:
                return 'paper_corrugated'
            elif 'paperboard' in component_form:
                return 'paper_paperboard'
            elif has_plastic_component:  # Paper with plastic coating
                return 'paper_coated'
            else:
                return 'paper_mixed'
                
        elif 'glass' in material_type:
            if 'clear' in component_form:
                return 'glass_clear'
            elif 'colored' in component_form or 'brown' in component_form or 'green' in component_form:
                return 'glass_colored'
            else:
                return 'glass_mixed'
                
        elif 'aluminum' in material_type:
            if 'can' in component_form:
                return 'metal_aluminum_cans'
            else:
                return 'metal_aluminum_other'
                
        elif 'steel' in material_type or 'metal' in material_type:
            if 'can' in component_form:
                return 'metal_steel_cans'
            else:
                return 'metal_steel_other'
                
        elif 'composite' in material_type or has_plastic_component:
            if 'paper' in material_type:
                return 'composite_paper_plastic'
            elif 'metal' in material_type:
                return 'composite_metal_plastic'
            else:
                return 'composite_other'
                
        return 'composite_other'
        
    def apply_eco_modulation(self, base_fee: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Apply California's eco-modulation rules.
        
        California focuses on:
        - Recyclability bonuses/penalties
        - Post-consumer recycled content bonuses
        - Plastic component penalties for non-recyclable items
        """
        packaging_data = report_data.get('packaging_data', [])
        modulated_fee = base_fee
        total_adjustment = Decimal('0')
        
        for component in packaging_data:
            component_weight = Decimal(str(component.get('weight_per_unit', 0))) * Decimal(str(component.get('units_sold', 0)))
            weight_ratio = component_weight / self._get_total_weight(packaging_data) if self._get_total_weight(packaging_data) > 0 else Decimal('0')
            
            # California-specific plastic component penalty for v2.0
            if component.get('ca_plastic_component_flag', False):
                plastic_component_penalty = base_fee * weight_ratio * Decimal('0.10')  # 10% penalty
                total_adjustment += plastic_component_penalty
            
            if component.get('recyclable', True):
                recyclability_bonus = base_fee * weight_ratio * Decimal('0.10')
                total_adjustment -= recyclability_bonus
            else:
                recyclability_penalty = base_fee * weight_ratio * Decimal('0.50')
                total_adjustment += recyclability_penalty
                
            pcr_percentage = Decimal(str(component.get('recycled_content_percentage', 0))) / Decimal('100')
            if pcr_percentage > Decimal('0.25'):  # >25% PCR content
                pcr_bonus = base_fee * weight_ratio * pcr_percentage * Decimal('0.15')
                total_adjustment -= pcr_bonus
                
            if component.get('contains_plastic', False) and not component.get('recyclable', True):
                plastic_penalty = base_fee * weight_ratio * Decimal('0.25')
                total_adjustment += plastic_penalty
                
        modulated_fee = base_fee + total_adjustment
        
        if modulated_fee < Decimal('0'):
            modulated_fee = Decimal('0')
            
        return self.round_to_currency_precision(modulated_fee)
        
    def _calculate_pollution_fund_allocation(self, report_data: Dict[str, Any]) -> Decimal:
        """
        Calculate allocation of $500M/year Plastic Pollution Mitigation Fund.
        
        Starting 2027, allocate $500M across all participating producers
        based on their proportional share of total system tonnage.
        """
        year = report_data.get('year', datetime.now().year)
        
        if year < 2027:
            return Decimal('0')
            
        producer_tonnage = Decimal(str(report_data.get('total_tonnage', 0)))
        system_total_tonnage = Decimal(str(report_data.get('system_total_tonnage', 1)))
        
        if system_total_tonnage > 0 and producer_tonnage > 0:
            allocation_ratio = producer_tonnage / system_total_tonnage
            annual_fund_amount = Decimal('500000000')  # $500M
            
            fund_allocation = annual_fund_amount * allocation_ratio
            
            return self.round_to_currency_precision(fund_allocation)
            
        return Decimal('0')
        
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """Apply California-specific exemptions beyond small producer exemption."""
        return fee
        
    def get_small_producer_thresholds(self) -> Dict[str, Any]:
        """Return California's small producer thresholds with v2.0 operator logic."""
        return {
            'revenue_threshold': Decimal('1000000'),  # $1M annual gross sales in CA
            'tonnage_threshold': None,                # No tonnage threshold for CA
            'operator': 'AND'
        }
        
    def _apply_small_producer_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply California's small producer exemption (zero fee)."""
        return {
            "jurisdiction": "California",
            "fee_type": "small_producer_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": "Annual gross sales in California < $1,000,000"
            }
        }
        
    def _get_cmc_breakdown(self, report_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get breakdown of CMC classifications for audit trail."""
        packaging_data = report_data.get('packaging_data', [])
        breakdown = []
        
        for i, component in enumerate(packaging_data):
            cmc_category = self._map_to_cmc_category(component)
            breakdown.append({
                "component_index": i,
                "material_type": component.get('material_type', 'unknown'),
                "cmc_category": cmc_category,
                "contains_plastic": component.get('contains_plastic', False),
                "recyclable": component.get('recyclable', True)
            })
            
        return breakdown
        
    def _get_total_weight(self, packaging_data: List[Dict[str, Any]]) -> Decimal:
        """Calculate total weight across all packaging components."""
        total_weight = Decimal('0')
        
        for component in packaging_data:
            weight_per_unit = Decimal(str(component.get('weight_per_unit', 0)))
            weight_unit = component.get('weight_unit', 'kg')
            units_sold = Decimal(str(component.get('units_sold', 0)))
            
            weight_kg = self.standardize_weight_to_kg(weight_per_unit, weight_unit)
            total_weight += weight_kg * units_sold
            
        return total_weight
