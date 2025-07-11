from decimal import Decimal
from typing import Dict, Any, List, Optional
from .base_strategy import FeeCalculationStrategy


class MaineFeeCalculationStrategy(FeeCalculationStrategy):
    """
    Maine EPR fee calculation strategy implementing Full Municipal Reimbursement (State-Run) model.
    
    This is the most complex EPR model with sophisticated municipal categorization and
    disposal method-based reimbursement calculations.
    
    Key Features:
    - Municipal categorization by geography and population
    - Disposal method-based reimbursement rates (100% recycled, 66.7% WTE, 33.3% landfill)
    - Eco-modulation with 2-5x multiplier for non-recyclable materials
    - PFAS and phthalates penalties
    - Multiple exemption categories (small producer, perishable food, low-volume option)
    """
    
    def __init__(self):
        super().__init__("ME")
        
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Maine EPR fees using Full Municipal Reimbursement (State-Run) model.
        
        Maine's complex calculation pipeline:
        1. Categorize municipalities by geography and population
        2. Calculate median per-ton costs for each material in each municipal group
        3. Calculate reimbursements based on disposal method
        4. Sum reimbursements and add administrative costs for total program cost
        5. Allocate total cost to producers based on packaging
        6. Apply eco-modulation (2-5x for non-recyclable, PFAS/phthalates penalties)
        """
        validation_errors = self.validate_producer_data(report_data.get('producer_data', {}))
        validation_errors.extend(self.validate_packaging_data(report_data.get('packaging_data', [])))
        
        if validation_errors:
            raise ValueError(f"Validation errors: {'; '.join(validation_errors)}")
            
        exemption_result = self._check_exemptions(report_data)
        if exemption_result:
            return exemption_result
            
        municipal_groups = self._categorize_municipalities(report_data.get('municipalities', []))
        municipal_reimbursements = self._calculate_municipal_reimbursements(municipal_groups, report_data)
        total_program_cost = self._calculate_total_program_cost(municipal_reimbursements, report_data)
        producer_allocation = self._allocate_cost_to_producer(total_program_cost, report_data)
        
        eco_modulated_fee = self.apply_eco_modulation(producer_allocation, report_data)
        
        final_fee = self.apply_exemptions(eco_modulated_fee, report_data.get('producer_data', {}))
        
        return {
            "jurisdiction": "Maine",
            "municipal_reimbursements": municipal_reimbursements,
            "total_program_cost": total_program_cost,
            "producer_allocation": producer_allocation,
            "eco_modulated_fee": eco_modulated_fee,
            "final_fee": final_fee,
            "calculation_breakdown": {
                "reimbursement_model": "Full Municipal Reimbursement (State-Run)",
                "municipal_groups": len(municipal_groups),
                "disposal_method_breakdown": self._get_disposal_breakdown(report_data),
                "eco_modulation_factors": self._get_eco_modulation_breakdown(report_data)
            }
        }
        
    def _categorize_municipalities(self, municipalities: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Categorize municipalities into groups based on geography and population.
        
        Maine uses geographic and demographic factors to group municipalities
        for median cost calculations.
        """
        groups = {
            'urban_large': [],      # Population > 50,000
            'urban_medium': [],     # Population 20,000-50,000
            'suburban': [],         # Population 5,000-20,000
            'rural_accessible': [], # Population 1,000-5,000, accessible
            'rural_remote': []      # Population < 1,000 or remote
        }
        
        for municipality in municipalities:
            population = municipality.get('population', 0)
            is_remote = municipality.get('is_remote', False)
            
            if population > 50000:
                groups['urban_large'].append(municipality)
            elif population > 20000:
                groups['urban_medium'].append(municipality)
            elif population > 5000:
                groups['suburban'].append(municipality)
            elif population > 1000 and not is_remote:
                groups['rural_accessible'].append(municipality)
            else:
                groups['rural_remote'].append(municipality)
                
        return groups
        
    def _calculate_municipal_reimbursements(self, municipal_groups: Dict[str, List[Dict[str, Any]]], 
                                          report_data: Dict[str, Any]) -> Dict[str, Decimal]:
        """
        Calculate reimbursements to municipalities based on disposal method.
        
        Reimbursement rates:
        - Recycled: 100% of median cost
        - Waste-to-Energy: 66.7% (2/3) of median cost  
        - Landfill: 33.3% (1/3) of median cost
        """
        reimbursements = {}
        
        for group_name, municipalities in municipal_groups.items():
            median_costs = self._get_median_costs_by_material(group_name, report_data)
            
            for municipality in municipalities:
                municipality_id = municipality.get('id', f"unknown_{len(reimbursements)}")
                total_reimbursement = Decimal('0')
                
                for material_type, median_cost in median_costs.items():
                    recycled_tons = Decimal(str(municipality.get(f'{material_type}_recycled_tons', 0)))
                    wte_tons = Decimal(str(municipality.get(f'{material_type}_wte_tons', 0)))
                    landfill_tons = Decimal(str(municipality.get(f'{material_type}_landfill_tons', 0)))
                    
                    recycled_reimbursement = recycled_tons * median_cost * Decimal('1.0')      # 100%
                    wte_reimbursement = wte_tons * median_cost * Decimal('0.667')              # 66.7%
                    landfill_reimbursement = landfill_tons * median_cost * Decimal('0.333')   # 33.3%
                    
                    material_reimbursement = recycled_reimbursement + wte_reimbursement + landfill_reimbursement
                    total_reimbursement += material_reimbursement
                    
                reimbursements[municipality_id] = self.round_to_currency_precision(total_reimbursement)
                
        return reimbursements
        
    def _get_median_costs_by_material(self, group_name: str, report_data: Dict[str, Any]) -> Dict[str, Decimal]:
        """
        Get median per-ton costs for each material in the municipal group.
        
        In production, this would query historical cost data from municipalities.
        """
        base_costs = {
            'plastic': Decimal('150.00'),
            'glass': Decimal('80.00'),
            'metal': Decimal('120.00'),
            'paper': Decimal('60.00'),
            'cardboard': Decimal('45.00'),
            'composite': Decimal('200.00')
        }
        
        group_multipliers = {
            'urban_large': Decimal('0.85'),      # Economies of scale
            'urban_medium': Decimal('0.95'),     # Moderate efficiency
            'suburban': Decimal('1.0'),          # Baseline
            'rural_accessible': Decimal('1.15'), # Higher transport costs
            'rural_remote': Decimal('1.35')      # Highest costs due to remoteness
        }
        
        multiplier = group_multipliers.get(group_name, Decimal('1.0'))
        
        return {material: cost * multiplier for material, cost in base_costs.items()}
        
    def _calculate_total_program_cost(self, municipal_reimbursements: Dict[str, Decimal], 
                                    report_data: Dict[str, Any]) -> Decimal:
        """
        Calculate total program cost including municipal reimbursements and administrative costs.
        """
        total_reimbursements = sum(municipal_reimbursements.values())
        
        system_data = report_data.get('system_data', {})
        administrative_costs = Decimal(str(system_data.get('administrative_costs', total_reimbursements * Decimal('0.15'))))  # 15% of reimbursements
        infrastructure_costs = Decimal(str(system_data.get('infrastructure_costs', total_reimbursements * Decimal('0.10'))))  # 10% of reimbursements
        
        total_program_cost = total_reimbursements + administrative_costs + infrastructure_costs
        
        return self.round_to_currency_precision(total_program_cost)
        
    def _allocate_cost_to_producer(self, total_cost: Decimal, report_data: Dict[str, Any]) -> Decimal:
        """
        Allocate total program cost to individual producer based on reported packaging.
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
        Apply Maine's eco-modulation rules.
        
        Maine's eco-modulation:
        - Non-recyclable materials: 2-5x multiplier
        - PFAS-containing packaging: significant penalty
        - Phthalates-containing packaging: significant penalty
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
            component_base_fee = base_fee * weight_ratio
            
            if component.get('me_toxicity_flag', False):
                toxicity_penalty = component_base_fee * Decimal('0.25')  # 25% penalty
                total_adjustment += toxicity_penalty
            
            if not component.get('recyclable', True):
                recyclability_score = Decimal(str(component.get('recyclability_score', 0))) / Decimal('100')
                
                if recyclability_score < Decimal('0.20'):  # <20% recyclable
                    multiplier = Decimal('5.0')  # 5x penalty
                elif recyclability_score < Decimal('0.40'):  # 20-40% recyclable
                    multiplier = Decimal('4.0')  # 4x penalty
                elif recyclability_score < Decimal('0.60'):  # 40-60% recyclable
                    multiplier = Decimal('3.0')  # 3x penalty
                else:  # 60-80% recyclable
                    multiplier = Decimal('2.0')  # 2x penalty
                    
                non_recyclable_penalty = component_base_fee * (multiplier - Decimal('1.0'))
                total_adjustment += non_recyclable_penalty
                
            if component.get('contains_pfas', False):
                pfas_penalty = component_base_fee * Decimal('1.0')  # 100% penalty
                total_adjustment += pfas_penalty
                
            if component.get('contains_phthalates', False):
                phthalates_penalty = component_base_fee * Decimal('0.75')  # 75% penalty
                total_adjustment += phthalates_penalty
                
            recyclability_score = Decimal(str(component.get('recyclability_score', 50))) / Decimal('100')
            if recyclability_score > Decimal('0.90'):  # >90% recyclable
                design_bonus = component_base_fee * Decimal('0.20')  # 20% bonus
                total_adjustment -= design_bonus
            elif recyclability_score < Decimal('0.30'):  # <30% recyclable
                design_penalty = component_base_fee * Decimal('0.50')  # 50% penalty
                total_adjustment += design_penalty
                
            pcr_percentage = Decimal(str(component.get('recycled_content_percentage', 0))) / Decimal('100')
            if pcr_percentage > Decimal('0.50'):  # >50% PCR content
                pcr_bonus = component_base_fee * pcr_percentage * Decimal('0.25')  # Up to 25% bonus
                total_adjustment -= pcr_bonus
                
        modulated_fee = base_fee + total_adjustment
        
        if modulated_fee < Decimal('0'):
            modulated_fee = Decimal('0')
            
        return self.round_to_currency_precision(modulated_fee)
        
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """Apply Maine-specific exemptions beyond the main exemption checks."""
        return fee
        
    def get_small_producer_thresholds(self) -> Dict[str, Any]:
        """Return Maine's small producer thresholds with v2.0 operator logic."""
        return {
            'revenue_threshold': Decimal('1000000'),  # $1M gross revenue
            'tonnage_threshold': Decimal('10.0'),     # 10 tons of packaging
            'operator': 'OR'  # Either condition qualifies for exemption
        }
        
    def _check_exemptions(self, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Check all Maine exemption categories.
        
        Maine has multiple exemption types:
        1. Small producer exemption
        2. Perishable food producer exemption
        3. Low-volume option (flat fee)
        """
        producer_data = report_data.get('producer_data', {})
        
        if self.is_small_producer(producer_data):
            return self._apply_small_producer_exemption(report_data)
            
        if self._qualifies_for_perishable_food_exemption(producer_data):
            return self._apply_perishable_food_exemption(report_data)
            
        if self._qualifies_for_low_volume_option(producer_data):
            return self._calculate_low_volume_flat_fee(report_data)
            
        return None
        
    def _qualifies_for_perishable_food_exemption(self, producer_data: Dict[str, Any]) -> bool:
        """
        Check if producer qualifies for perishable food exemption.
        
        Qualifies if: produces perishable food AND used < 15 tons of packaging
        """
        is_perishable_food_producer = producer_data.get('produces_perishable_food', False)
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        
        return is_perishable_food_producer and annual_tonnage < Decimal('15.0')
        
    def _qualifies_for_low_volume_option(self, producer_data: Dict[str, Any]) -> bool:
        """
        Check if producer qualifies for low-volume flat fee option.
        
        Qualifies if: sending < 15 tons of packaging
        """
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        return annual_tonnage < Decimal('15.0')
        
    def _calculate_low_volume_flat_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Maine's low-volume flat fee option.
        
        $500 per ton for producers sending < 15 tons of packaging.
        """
        producer_data = report_data.get('producer_data', {})
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        
        flat_fee_rate = Decimal('500.00')  # $500 per ton
        flat_fee = annual_tonnage * flat_fee_rate
        
        return {
            "jurisdiction": "Maine",
            "fee_type": "low_volume_flat_fee",
            "annual_tonnage": annual_tonnage,
            "flat_fee_rate": flat_fee_rate,
            "flat_fee": flat_fee,
            "final_fee": flat_fee,
            "calculation_breakdown": {
                "calculation": f"{annual_tonnage} tons × ${flat_fee_rate}/ton = ${flat_fee}"
            }
        }
        
    def _apply_small_producer_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Maine's small producer exemption (zero fee)."""
        return {
            "jurisdiction": "Maine",
            "fee_type": "small_producer_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": "Revenue < $1M OR tonnage < 10 tons"
            }
        }
        
    def _apply_perishable_food_exemption(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Apply Maine's perishable food producer exemption (zero fee)."""
        return {
            "jurisdiction": "Maine",
            "fee_type": "perishable_food_exemption",
            "final_fee": Decimal('0'),
            "calculation_breakdown": {
                "exemption_reason": "Perishable food producer with < 15 tons packaging"
            }
        }
        
    def _get_disposal_breakdown(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get breakdown of disposal methods for audit trail."""
        municipalities = report_data.get('municipalities', [])
        
        total_recycled = Decimal('0')
        total_wte = Decimal('0')
        total_landfill = Decimal('0')
        
        for municipality in municipalities:
            for material in ['plastic', 'glass', 'metal', 'paper', 'cardboard', 'composite']:
                total_recycled += Decimal(str(municipality.get(f'{material}_recycled_tons', 0)))
                total_wte += Decimal(str(municipality.get(f'{material}_wte_tons', 0)))
                total_landfill += Decimal(str(municipality.get(f'{material}_landfill_tons', 0)))
                
        total_tons = total_recycled + total_wte + total_landfill
        
        if total_tons > 0:
            return {
                "recycled_percentage": float((total_recycled / total_tons * Decimal('100')).quantize(Decimal('0.1'))),
                "waste_to_energy_percentage": float((total_wte / total_tons * Decimal('100')).quantize(Decimal('0.1'))),
                "landfill_percentage": float((total_landfill / total_tons * Decimal('100')).quantize(Decimal('0.1'))),
                "total_tons": float(total_tons)
            }
        
        return {"recycled_percentage": 0, "waste_to_energy_percentage": 0, "landfill_percentage": 0, "total_tons": 0}
        
    def _get_eco_modulation_breakdown(self, report_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get breakdown of eco-modulation factors applied."""
        packaging_data = report_data.get('packaging_data', [])
        breakdown = []
        
        for i, component in enumerate(packaging_data):
            factors = []
            
            if not component.get('recyclable', True):
                recyclability_score = component.get('recyclability_score', 0)
                if recyclability_score < 20:
                    factors.append("Non-recyclable Penalty: 5x multiplier")
                elif recyclability_score < 40:
                    factors.append("Non-recyclable Penalty: 4x multiplier")
                elif recyclability_score < 60:
                    factors.append("Non-recyclable Penalty: 3x multiplier")
                else:
                    factors.append("Non-recyclable Penalty: 2x multiplier")
                    
            if component.get('contains_pfas', False):
                factors.append("PFAS Penalty: 100%")
                
            if component.get('contains_phthalates', False):
                factors.append("Phthalates Penalty: 75%")
                
            recyclability_score = component.get('recyclability_score', 50)
            if recyclability_score > 90:
                factors.append("High Recyclability Bonus: 20%")
            elif recyclability_score < 30:
                factors.append("Low Recyclability Penalty: 50%")
                
            pcr_percentage = component.get('recycled_content_percentage', 0)
            if pcr_percentage > 50:
                factors.append(f"PCR Content Bonus: {pcr_percentage}% content")
                
            breakdown.append({
                "component_index": i,
                "material_type": component.get('material_type', 'unknown'),
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
