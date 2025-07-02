from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session

from .database import CalculatedFee, CalculationStep, Jurisdiction, MaterialCategory, FeeRate
from .calculation_strategies import (
    FeeCalculationStrategy,
    OregonFeeCalculationStrategy,
    CaliforniaFeeCalculationStrategy,
    ColoradoFeeCalculationStrategy,
    MaineFeeCalculationStrategy,
    SharedResponsibilityStrategy
)


class EPRCalculationEngine:
    """
    Comprehensive EPR fee calculation engine implementing the 8-stage calculation pipeline.
    
    The 8 stages are:
    1. Data Ingestion & Standardization
    2. Unit Standardization
    3. Material Classification
    4. Base Fee Calculation
    5. Eco-Modulation
    6. Discounts & Exemptions
    7. Aggregation & Rounding
    8. Audit Trail Generation
    
    This engine uses the Strategy Design Pattern to delegate jurisdiction-specific
    calculations to the appropriate strategy class while maintaining a consistent
    audit trail for legal defensibility.
    """
    
    def __init__(self, jurisdiction_code: str, db: Optional[Session] = None):
        self.jurisdiction_code = jurisdiction_code.upper()
        self.db = db
        self.strategy = self._get_strategy(jurisdiction_code)
        self.calculation_steps: List[Dict[str, Any]] = []
        
    def _get_strategy(self, jurisdiction_code: str) -> FeeCalculationStrategy:
        """
        Get the appropriate calculation strategy for the jurisdiction.
        
        Args:
            jurisdiction_code: Two-letter jurisdiction code (OR, CA, CO, ME, MD, MN, WA)
            
        Returns:
            Jurisdiction-specific calculation strategy
            
        Raises:
            ValueError: If jurisdiction code is not supported
        """
        jurisdiction_upper = jurisdiction_code.upper()
        
        if jurisdiction_upper == 'OR':
            return OregonFeeCalculationStrategy()
        elif jurisdiction_upper == 'CA':
            return CaliforniaFeeCalculationStrategy()
        elif jurisdiction_upper == 'CO':
            return ColoradoFeeCalculationStrategy()
        elif jurisdiction_upper == 'ME':
            return MaineFeeCalculationStrategy()
        elif jurisdiction_upper in ['MD', 'MN', 'WA']:
            return SharedResponsibilityStrategy(jurisdiction_upper)
        else:
            raise ValueError(f"Unsupported jurisdiction: {jurisdiction_code}. "
                           f"Supported jurisdictions: OR, CA, CO, ME, MD, MN, WA")
        
    def calculate_epr_fee_comprehensive(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the full 8-stage EPR fee calculation pipeline.
        
        Args:
            report_data: Complete producer and packaging data for calculation
            
        Returns:
            Comprehensive calculation result with audit trail
            
        Raises:
            ValueError: If input data validation fails
            Exception: If calculation fails at any stage
        """
        calculation_id = self._generate_calculation_id()
        self.calculation_steps = []
        
        try:
            ingested_data = self._stage_1_data_ingestion(report_data)
            
            standardized_data = self._stage_2_unit_standardization(ingested_data)
            
            classified_data = self._stage_3_material_classification(standardized_data)
            
            base_fee_data = self._stage_4_base_fee_calculation(classified_data)
            
            eco_modulated_data = self._stage_5_eco_modulation(base_fee_data)
            
            exemption_data = self._stage_6_discounts_exemptions(eco_modulated_data)
            
            aggregated_data = self._stage_7_aggregation_rounding(exemption_data)
            
            audit_trail = self._stage_8_audit_trail_generation(calculation_id, aggregated_data)
            
            if self.db:
                self._persist_calculation(calculation_id, aggregated_data, audit_trail)
                
            return {
                "calculation_id": calculation_id,
                "jurisdiction": self.jurisdiction_code,
                "total_fee": aggregated_data["final_fee"],
                "currency": "USD",
                "calculation_timestamp": datetime.now(timezone.utc).isoformat(),
                "audit_trail": audit_trail,
                "calculation_breakdown": aggregated_data.get("calculation_breakdown", {}),
                "legal_citations": self._get_legal_citations(),
                "compliance_status": "CALCULATED"
            }
            
        except Exception as e:
            error_step = self._create_calculation_step(
                step_number=len(self.calculation_steps) + 1,
                step_name="Calculation Error",
                input_data=report_data,
                output_data={"error": str(e)},
                rule_applied="Error handling",
                legal_citation="N/A - Calculation Failed",
                calculation_method=f"Error occurred: {str(e)}"
            )
            self.calculation_steps.append(error_step)
            
            raise Exception(f"EPR calculation failed for {self.jurisdiction_code}: {str(e)}")
            
    def _stage_1_data_ingestion(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 1: Data Ingestion & Standardization
        
        Validate and normalize input data for calculation pipeline.
        """
        producer_data = report_data.get('producer_data', {})
        producer_validation_errors = self.strategy.validate_producer_data(producer_data)
        
        packaging_data = report_data.get('packaging_data', [])
        packaging_validation_errors = self.strategy.validate_packaging_data(packaging_data)
        
        all_errors = producer_validation_errors + packaging_validation_errors
        
        if all_errors:
            raise ValueError(f"Data validation failed: {'; '.join(all_errors)}")
            
        ingested_data = {
            "producer_data": self._normalize_producer_data(producer_data),
            "packaging_data": self._normalize_packaging_data(packaging_data),
            "system_data": report_data.get('system_data', {}),
            "calculation_date": report_data.get('calculation_date', datetime.now().isoformat()),
            "metadata": {
                "data_source": report_data.get('data_source', 'api'),
                "validation_passed": True,
                "total_components": len(packaging_data)
            }
        }
        
        step = self._create_calculation_step(
            step_number=1,
            step_name="Data Ingestion & Standardization",
            input_data=report_data,
            output_data=ingested_data,
            rule_applied="EPR Data Validation and Normalization Standards",
            legal_citation=f"{self.jurisdiction_code} EPR Regulation Section 1.2 - Data Requirements",
            calculation_method="Validate producer and packaging data against jurisdiction requirements, "
                             "normalize data structure for calculation pipeline"
        )
        self.calculation_steps.append(step)
        
        return ingested_data
        
    def _stage_2_unit_standardization(self, ingested_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 2: Unit Standardization
        
        Convert all weight measurements to kilograms (internal standard).
        """
        packaging_data = ingested_data["packaging_data"]
        standardized_packaging = []
        
        total_original_weight = Decimal('0')
        total_standardized_weight = Decimal('0')
        
        for component in packaging_data:
            original_weight = Decimal(str(component.get('weight_per_unit', 0)))
            original_unit = component.get('weight_unit', 'kg')
            units_sold = Decimal(str(component.get('units_sold', 0)))
            
            standardized_weight_per_unit = self.strategy.standardize_weight_to_kg(original_weight, original_unit)
            
            original_total = original_weight * units_sold
            standardized_total = standardized_weight_per_unit * units_sold
            
            total_original_weight += original_total
            total_standardized_weight += standardized_total
            
            standardized_component = component.copy()
            standardized_component.update({
                'weight_per_unit': standardized_weight_per_unit,
                'weight_unit': 'kg',
                'original_weight_per_unit': original_weight,
                'original_weight_unit': original_unit,
                'total_weight_kg': standardized_total
            })
            
            standardized_packaging.append(standardized_component)
            
        standardized_data = ingested_data.copy()
        standardized_data["packaging_data"] = standardized_packaging
        standardized_data["total_weight_kg"] = total_standardized_weight
        
        step = self._create_calculation_step(
            step_number=2,
            step_name="Unit Standardization",
            input_data=ingested_data,
            output_data=standardized_data,
            rule_applied="Weight Unit Conversion to Kilograms",
            legal_citation="ISO 80000-1 International System of Units (SI)",
            calculation_method=f"Convert all weight measurements to kg using standard conversion factors. "
                             f"Total weight: {total_standardized_weight} kg"
        )
        self.calculation_steps.append(step)
        
        return standardized_data
        
    def _stage_3_material_classification(self, standardized_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 3: Material Classification
        
        Map packaging materials to jurisdiction-specific material categories.
        """
        packaging_data = standardized_data["packaging_data"]
        classified_packaging = []
        
        classification_summary = {}
        
        for component in packaging_data:
            material_type = component.get('material_type', 'unknown')
            
            classified_material = self._classify_material_for_jurisdiction(component)
            
            classified_component = component.copy()
            classified_component.update({
                'jurisdiction_material_category': classified_material['category'],
                'material_classification_code': classified_material['code'],
                'recyclable': classified_material['recyclable'],
                'fee_applicable': classified_material['fee_applicable']
            })
            
            classified_packaging.append(classified_component)
            
            category = classified_material['category']
            if category not in classification_summary:
                classification_summary[category] = {
                    'count': 0,
                    'total_weight': Decimal('0')
                }
            classification_summary[category]['count'] += 1
            classification_summary[category]['total_weight'] += component['total_weight_kg']
            
        classified_data = standardized_data.copy()
        classified_data["packaging_data"] = classified_packaging
        classified_data["material_classification_summary"] = classification_summary
        
        step = self._create_calculation_step(
            step_number=3,
            step_name="Material Classification",
            input_data=standardized_data,
            output_data=classified_data,
            rule_applied="Jurisdiction-Specific Material Category Mapping",
            legal_citation=f"{self.jurisdiction_code} Material Classification Guidelines and Fee Schedule",
            calculation_method=f"Map {len(packaging_data)} packaging components to jurisdiction material categories. "
                             f"Categories identified: {', '.join(classification_summary.keys())}"
        )
        self.calculation_steps.append(step)
        
        return classified_data
        
    def _stage_4_base_fee_calculation(self, classified_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 4: Base Fee Calculation
        
        Calculate base fees using jurisdiction-specific rates and formulas.
        """
        base_fee_result = self.strategy.calculate_fee(classified_data)
        
        base_fee = self._extract_base_fee_from_result(base_fee_result)
        
        base_fee_data = classified_data.copy()
        base_fee_data.update({
            "base_fee": base_fee,
            "base_fee_breakdown": base_fee_result.get("calculation_breakdown", {}),
            "jurisdiction_specific_data": base_fee_result
        })
        
        step = self._create_calculation_step(
            step_number=4,
            step_name="Base Fee Calculation",
            input_data=classified_data,
            output_data=base_fee_data,
            rule_applied=f"{self.jurisdiction_code} Base Fee Calculation Formula",
            legal_citation=f"{self.jurisdiction_code} EPR Fee Schedule and Rate Tables",
            calculation_method=f"Apply jurisdiction-specific base fee calculation. "
                             f"Base fee: ${base_fee}"
        )
        self.calculation_steps.append(step)
        
        return base_fee_data
        
    def _stage_5_eco_modulation(self, base_fee_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 5: Eco-Modulation
        
        Apply sustainability bonuses and penalties.
        """
        base_fee = base_fee_data["base_fee"]
        
        eco_modulated_fee = self.strategy.apply_eco_modulation(base_fee, base_fee_data)
        
        eco_adjustment = eco_modulated_fee - base_fee
        eco_adjustment_percentage = (eco_adjustment / base_fee * Decimal('100')) if base_fee > 0 else Decimal('0')
        
        eco_modulated_data = base_fee_data.copy()
        eco_modulated_data.update({
            "eco_modulated_fee": eco_modulated_fee,
            "eco_adjustment": eco_adjustment,
            "eco_adjustment_percentage": eco_adjustment_percentage
        })
        
        step = self._create_calculation_step(
            step_number=5,
            step_name="Eco-Modulation",
            input_data=base_fee_data,
            output_data=eco_modulated_data,
            rule_applied=f"{self.jurisdiction_code} Eco-Modulation Rules and Sustainability Factors",
            legal_citation=f"{self.jurisdiction_code} Environmental Impact Adjustment Regulations",
            calculation_method=f"Apply sustainability bonuses/penalties. "
                             f"Adjustment: ${eco_adjustment} ({eco_adjustment_percentage:.2f}%)"
        )
        self.calculation_steps.append(step)
        
        return eco_modulated_data
        
    def _stage_6_discounts_exemptions(self, eco_modulated_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 6: Discounts & Exemptions
        
        Apply small producer exemptions and other discounts.
        """
        eco_modulated_fee = eco_modulated_data["eco_modulated_fee"]
        producer_data = eco_modulated_data["producer_data"]
        
        is_small_producer = self.strategy.is_small_producer(producer_data)
        
        if is_small_producer:
            final_fee = Decimal('0')
            exemption_applied = "Small Producer Exemption"
            exemption_amount = eco_modulated_fee
        else:
            final_fee = self.strategy.apply_exemptions(eco_modulated_fee, producer_data)
            exemption_amount = eco_modulated_fee - final_fee
            exemption_applied = "Standard Exemptions" if exemption_amount > 0 else "No Exemptions"
            
        exemption_data = eco_modulated_data.copy()
        exemption_data.update({
            "final_fee_before_rounding": final_fee,
            "exemption_applied": exemption_applied,
            "exemption_amount": exemption_amount,
            "is_small_producer": is_small_producer
        })
        
        step = self._create_calculation_step(
            step_number=6,
            step_name="Discounts & Exemptions",
            input_data=eco_modulated_data,
            output_data=exemption_data,
            rule_applied=f"{self.jurisdiction_code} Exemption Criteria and Discount Rules",
            legal_citation=f"{self.jurisdiction_code} Small Producer and Exemption Regulations",
            calculation_method=f"Apply exemptions and discounts. "
                             f"Exemption: {exemption_applied}, Amount: ${exemption_amount}"
        )
        self.calculation_steps.append(step)
        
        return exemption_data
        
    def _stage_7_aggregation_rounding(self, exemption_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 7: Aggregation & Rounding
        
        Sum all fees and round to currency precision.
        """
        final_fee_before_rounding = exemption_data["final_fee_before_rounding"]
        
        final_fee = self.strategy.round_to_currency_precision(final_fee_before_rounding)
        
        rounding_adjustment = final_fee - final_fee_before_rounding
        
        aggregated_data = exemption_data.copy()
        aggregated_data.update({
            "final_fee": final_fee,
            "rounding_adjustment": rounding_adjustment,
            "currency": "USD",
            "calculation_complete": True
        })
        
        step = self._create_calculation_step(
            step_number=7,
            step_name="Aggregation & Rounding",
            input_data=exemption_data,
            output_data=aggregated_data,
            rule_applied="Currency Precision Rounding Standards",
            legal_citation="Financial Calculation Standards - 2 Decimal Place Precision",
            calculation_method=f"Round final fee to currency precision. "
                             f"Final fee: ${final_fee}, Rounding adjustment: ${rounding_adjustment}"
        )
        self.calculation_steps.append(step)
        
        return aggregated_data
        
    def _stage_8_audit_trail_generation(self, calculation_id: str, aggregated_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Stage 8: Audit Trail Generation
        
        Generate comprehensive audit trail for legal defensibility.
        """
        final_step = self._create_calculation_step(
            step_number=8,
            step_name="Audit Trail Generation",
            input_data=aggregated_data,
            output_data={
                "calculation_id": calculation_id,
                "audit_trail_complete": True,
                "total_steps": len(self.calculation_steps) + 1
            },
            rule_applied="EPR Audit Trail and Traceability Requirements",
            legal_citation=f"{self.jurisdiction_code} EPR Compliance and Audit Regulations",
            calculation_method="Generate comprehensive step-by-step audit trail for legal defensibility "
                             "and regulatory compliance verification"
        )
        self.calculation_steps.append(final_step)
        
        return self.calculation_steps
        
    def _normalize_producer_data(self, producer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize producer data to standard format."""
        return {
            "organization_id": producer_data.get("organization_id"),
            "annual_revenue": Decimal(str(producer_data.get("annual_revenue", 0))),
            "annual_tonnage": Decimal(str(producer_data.get("annual_tonnage", 0))),
            "produces_perishable_food": producer_data.get("produces_perishable_food", False),
            "has_lca_disclosure": producer_data.get("has_lca_disclosure", False),
            "has_environmental_impact_reduction": producer_data.get("has_environmental_impact_reduction", False),
            "uses_reusable_packaging": producer_data.get("uses_reusable_packaging", False),
            "annual_recycling_rates": producer_data.get("annual_recycling_rates", [])
        }
        
    def _normalize_packaging_data(self, packaging_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize packaging data to standard format."""
        normalized = []
        
        for component in packaging_data:
            normalized_component = {
                "material_type": component.get("material_type", "unknown"),
                "component_name": component.get("component_name", "unknown"),
                "weight_per_unit": Decimal(str(component.get("weight_per_unit", 0))),
                "weight_unit": component.get("weight_unit", "kg"),
                "units_sold": int(component.get("units_sold", 0)),
                "recycled_content_percentage": Decimal(str(component.get("recycled_content_percentage", 0))),
                "recyclable": component.get("recyclable", True),
                "reusable": component.get("reusable", False),
                "disrupts_recycling": component.get("disrupts_recycling", False),
                "recyclability_score": Decimal(str(component.get("recyclability_score", 50))),
                "contains_pfas": component.get("contains_pfas", False),
                "contains_phthalates": component.get("contains_phthalates", False)
            }
            normalized.append(normalized_component)
            
        return normalized
        
    def _classify_material_for_jurisdiction(self, component: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify material for specific jurisdiction.
        
        This is a simplified implementation. In production, this would
        query the MaterialCategory database table for jurisdiction-specific mappings.
        """
        material_type = component.get('material_type', 'unknown').lower()
        
        if 'plastic' in material_type or 'pet' in material_type:
            return {
                'category': 'plastic',
                'code': 'PLA-001',
                'recyclable': True,
                'fee_applicable': True
            }
        elif 'glass' in material_type:
            return {
                'category': 'glass',
                'code': 'GLA-001',
                'recyclable': True,
                'fee_applicable': True
            }
        elif 'metal' in material_type or 'aluminum' in material_type:
            return {
                'category': 'metal',
                'code': 'MET-001',
                'recyclable': True,
                'fee_applicable': True
            }
        elif 'paper' in material_type:
            return {
                'category': 'paper',
                'code': 'PAP-001',
                'recyclable': True,
                'fee_applicable': True
            }
        elif 'cardboard' in material_type:
            return {
                'category': 'cardboard',
                'code': 'CAR-001',
                'recyclable': True,
                'fee_applicable': True
            }
        else:
            return {
                'category': 'composite',
                'code': 'COM-001',
                'recyclable': False,
                'fee_applicable': True
            }
            
    def _extract_base_fee_from_result(self, strategy_result: Dict[str, Any]) -> Decimal:
        """Extract base fee amount from strategy calculation result."""
        
        if "base_fee" in strategy_result:
            return Decimal(str(strategy_result["base_fee"]))
        elif "producer_allocation" in strategy_result:
            return Decimal(str(strategy_result["producer_allocation"]))
        elif "final_fee" in strategy_result:
            return Decimal(str(strategy_result["final_fee"]))
        else:
            return Decimal('0')
            
    def _create_calculation_step(self, step_number: int, step_name: str,
                               input_data: Any, output_data: Any,
                               rule_applied: str, legal_citation: str,
                               calculation_method: str) -> Dict[str, Any]:
        """Create a standardized calculation step for audit trail."""
        return {
            "step_number": step_number,
            "step_name": step_name,
            "input_data": input_data,
            "output_data": output_data,
            "rule_applied": rule_applied,
            "legal_citation": legal_citation,
            "calculation_method": calculation_method,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "jurisdiction": self.jurisdiction_code
        }
        
    def _generate_calculation_id(self) -> str:
        """Generate unique calculation ID."""
        return f"{self.jurisdiction_code}-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        
    def _get_legal_citations(self) -> List[str]:
        """Get all legal citations used in the calculation."""
        citations = []
        for step in self.calculation_steps:
            citation = step.get("legal_citation")
            if citation and citation not in citations:
                citations.append(citation)
        return citations
        
    def _persist_calculation(self, calculation_id: str, aggregated_data: Dict[str, Any], 
                           audit_trail: List[Dict[str, Any]]) -> None:
        """
        Persist calculation results to database.
        
        This method stores the calculation and audit trail in the database
        for compliance and audit purposes.
        """
        if not self.db:
            return
            
        try:
            calculated_fee = CalculatedFee(
                id=calculation_id,
                producer_id=aggregated_data["producer_data"]["organization_id"],
                jurisdiction_id=self.jurisdiction_code,
                total_fee=aggregated_data["final_fee"],
                currency="USD",
                status="calculated",
                input_data=aggregated_data["producer_data"]
            )
            
            self.db.add(calculated_fee)
            
            for step_data in audit_trail:
                calculation_step = CalculationStep(
                    calculated_fee_id=calculation_id,
                    step_number=step_data["step_number"],
                    step_name=step_data["step_name"],
                    input_data=step_data["input_data"],
                    output_data=step_data["output_data"],
                    rule_applied=step_data["rule_applied"],
                    legal_citation=step_data["legal_citation"],
                    calculation_method=step_data["calculation_method"]
                )
                
                self.db.add(calculation_step)
                
            self.db.commit()
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to persist calculation: {str(e)}")


def create_calculation_engine(jurisdiction_code: str, db: Optional[Session] = None) -> EPRCalculationEngine:
    """
    Factory function to create EPR calculation engine for a jurisdiction.
    
    Args:
        jurisdiction_code: Two-letter jurisdiction code
        db: Optional database session for persistence
        
    Returns:
        Configured EPR calculation engine
    """
    return EPRCalculationEngine(jurisdiction_code, db)
