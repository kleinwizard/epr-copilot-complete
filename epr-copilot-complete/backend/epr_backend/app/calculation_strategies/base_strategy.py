from abc import ABC, abstractmethod
from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import datetime


class FeeCalculationStrategy(ABC):
    """
    Abstract base class for jurisdiction-specific EPR fee calculation strategies.
    
    Each jurisdiction implements its own calculation logic while following
    the standardized 8-stage calculation pipeline:
    1. Data Ingestion & Standardization
    2. Unit Standardization  
    3. Material Classification
    4. Base Fee Calculation
    5. Eco-Modulation
    6. Discounts & Exemptions
    7. Aggregation & Rounding
    8. Audit Trail Generation
    """
    
    def __init__(self, jurisdiction_code: str):
        self.jurisdiction_code = jurisdiction_code
        
    @abstractmethod
    def calculate_fee(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate fees for the jurisdiction using the full calculation pipeline.
        
        Args:
            report_data: Producer and packaging data for fee calculation
            
        Returns:
            Dictionary containing calculation results and breakdown
        """
        pass
        
    @abstractmethod
    def apply_eco_modulation(self, base_fee: Decimal, material_data: Dict) -> Decimal:
        """
        Apply jurisdiction-specific eco-modulation rules.
        
        Args:
            base_fee: Base fee before eco-modulation
            material_data: Material properties for eco-modulation rules
            
        Returns:
            Fee after applying eco-modulation bonuses/penalties
        """
        pass
        
    @abstractmethod
    def apply_exemptions(self, fee: Decimal, producer_data: Dict) -> Decimal:
        """
        Apply jurisdiction-specific exemptions and discounts.
        
        Args:
            fee: Fee before exemptions
            producer_data: Producer information for exemption eligibility
            
        Returns:
            Final fee after applying exemptions
        """
        pass
        
    @abstractmethod
    def get_small_producer_thresholds(self) -> Dict[str, Optional[Decimal]]:
        """
        Return revenue and tonnage thresholds for small producer exemptions.
        
        Returns:
            Dictionary with 'revenue_threshold' and 'tonnage_threshold' keys.
            Values can be None if threshold doesn't apply for the jurisdiction.
        """
        pass
        
    def standardize_weight_to_kg(self, weight: Decimal, unit: str) -> Decimal:
        """
        Convert weight measurements to kilograms (internal standard).
        
        Args:
            weight: Weight value
            unit: Unit of measurement (kg, lb, g, oz, ton)
            
        Returns:
            Weight in kilograms with high precision
        """
        conversion_factors = {
            'kg': Decimal('1.0'),
            'g': Decimal('0.001'),
            'lb': Decimal('0.453592'),
            'oz': Decimal('0.0283495'),
            'ton': Decimal('1000.0'),
            'tonne': Decimal('1000.0')
        }
        
        unit_lower = unit.lower()
        if unit_lower not in conversion_factors:
            raise ValueError(f"Unsupported weight unit: {unit}")
            
        return weight * conversion_factors[unit_lower]
        
    def round_to_currency_precision(self, amount: Decimal) -> Decimal:
        """
        Round monetary amounts to two decimal places for currency.
        
        Args:
            amount: Decimal amount to round
            
        Returns:
            Amount rounded to 2 decimal places
        """
        return amount.quantize(Decimal('0.01'))
        
    def validate_producer_data(self, producer_data: Dict[str, Any]) -> List[str]:
        """
        Validate producer data for calculation requirements.
        
        Args:
            producer_data: Producer information dictionary
            
        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []
        
        required_fields = ['organization_id', 'annual_revenue', 'annual_tonnage']
        for field in required_fields:
            if field not in producer_data:
                errors.append(f"Missing required field: {field}")
                
        if 'annual_revenue' in producer_data:
            try:
                revenue = Decimal(str(producer_data['annual_revenue']))
                if revenue < 0:
                    errors.append("Annual revenue cannot be negative")
            except (ValueError, TypeError):
                errors.append("Annual revenue must be a valid number")
                
        if 'annual_tonnage' in producer_data:
            try:
                tonnage = Decimal(str(producer_data['annual_tonnage']))
                if tonnage < 0:
                    errors.append("Annual tonnage cannot be negative")
            except (ValueError, TypeError):
                errors.append("Annual tonnage must be a valid number")
                
        return errors
        
    def validate_packaging_data(self, packaging_data: List[Dict[str, Any]]) -> List[str]:
        """
        Validate packaging component data for calculation requirements.
        
        Args:
            packaging_data: List of packaging component dictionaries
            
        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []
        
        if not packaging_data:
            errors.append("At least one packaging component is required")
            return errors
            
        required_fields = ['material_type', 'weight_per_unit', 'weight_unit', 'units_sold']
        
        for i, component in enumerate(packaging_data):
            for field in required_fields:
                if field not in component:
                    errors.append(f"Component {i+1}: Missing required field '{field}'")
                    
            if 'weight_per_unit' in component:
                try:
                    weight = Decimal(str(component['weight_per_unit']))
                    if weight <= 0:
                        errors.append(f"Component {i+1}: Weight per unit must be positive")
                except (ValueError, TypeError):
                    errors.append(f"Component {i+1}: Weight per unit must be a valid number")
                    
            if 'units_sold' in component:
                try:
                    units = int(component['units_sold'])
                    if units <= 0:
                        errors.append(f"Component {i+1}: Units sold must be positive")
                except (ValueError, TypeError):
                    errors.append(f"Component {i+1}: Units sold must be a valid integer")
                    
        return errors
        
    def is_small_producer(self, producer_data: Dict[str, Any]) -> bool:
        """
        Determine if producer qualifies for small producer exemptions.
        
        Args:
            producer_data: Producer information dictionary
            
        Returns:
            True if producer qualifies for small producer exemptions
        """
        thresholds = self.get_small_producer_thresholds()
        
        annual_revenue = Decimal(str(producer_data.get('annual_revenue', 0)))
        annual_tonnage = Decimal(str(producer_data.get('annual_tonnage', 0)))
        
        revenue_threshold = thresholds.get('revenue_threshold')
        tonnage_threshold = thresholds.get('tonnage_threshold')
        
        revenue_qualifies = revenue_threshold is None or annual_revenue < revenue_threshold
        tonnage_qualifies = tonnage_threshold is None or annual_tonnage < tonnage_threshold
        
        return revenue_qualifies and tonnage_qualifies
        
    def create_calculation_step(self, step_number: int, step_name: str, 
                              input_data: Any, output_data: Any,
                              rule_applied: str, legal_citation: str,
                              calculation_method: str) -> Dict[str, Any]:
        """
        Create a standardized calculation step for audit trail.
        
        Args:
            step_number: Sequential step number in calculation pipeline
            step_name: Human-readable name of calculation step
            input_data: Input data for this step
            output_data: Output data from this step
            rule_applied: Description of rule or formula applied
            legal_citation: Reference to legal source/regulation
            calculation_method: Detailed explanation of calculation
            
        Returns:
            Standardized calculation step dictionary
        """
        return {
            'step_number': step_number,
            'step_name': step_name,
            'input_data': input_data,
            'output_data': output_data,
            'rule_applied': rule_applied,
            'legal_citation': legal_citation,
            'calculation_method': calculation_method,
            'timestamp': datetime.now().isoformat()
        }
