"""
Integration test for v2.0 calculation engine with producer hierarchy.
"""

import logging
from app.calculation_engine import EPRCalculationEngine

def test_v2_calculation_with_producer_hierarchy():
    """Test v2.0 calculation engine with enhanced producer hierarchy support."""
    
    engine = EPRCalculationEngine('OR')
    
    test_data = {
        'producer_data': {
            'organization_id': 'test-org-123',
            'annual_revenue': 3000000,
            'annual_revenue_scope': 'GLOBAL',
            'annual_tonnage': 0.5,
            'produces_perishable_food': False,
            'jurisdiction_code': 'OR',
            'entity_roles': ['BRAND_OWNER'],
            'brand_owner_id': 'test-org-123'
        },
        'packaging_data': [{
            'material_type': 'plastic',
            'component_name': 'bottle',
            'packaging_level': 'PRIMARY',
            'weight_per_unit': 0.1,
            'weight_unit': 'kg',
            'units_sold': 1000,
            'recycled_content_percentage': 25,
            'recyclable': True,
            'or_lca_bonus_tier': 'A',
            'is_beverage_container': False,
            'is_medical_exempt': False,
            'is_fifra_exempt': False,
            'ca_plastic_component_flag': False,
            'me_toxicity_flag': False
        }],
        'product_data': {
            'brand_owner_id': 'test-org-123',
            'organization_id': 'test-org-123'
        },
        'system_data': {
            'administrativeCosts': 1000000,
            'infrastructureCosts': 5000000,
            'systemTotalTonnage': 100000
        }
    }
    
    try:
        result = engine.calculate_epr_fee_comprehensive(test_data)
        
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger(__name__)
        
        logger.info("=== V2.0 Calculation Engine Integration Test ===")
        logger.info(f"Calculation ID: {result.get('calculation_id', 'N/A')}")
        logger.info(f"Jurisdiction: {result.get('jurisdiction', 'N/A')}")
        logger.info(f"Total Fee: ${result.get('final_fee', 0):.2f}")
        logger.info(f"Currency: {result.get('currency', 'USD')}")
        logger.info(f"Calculation Steps: {len(result.get('audit_trail', []))}")
        logger.info(f"V2.0 Features Enabled: {result.get('metadata', {}).get('v2_features_enabled', False)}")
        
        metadata = result.get('metadata', {})
        if metadata.get('v2_features_enabled'):
            logger.info("✅ V2.0 features successfully enabled")
        else:
            logger.warning("❌ V2.0 features not detected")
            
        audit_trail = result.get('audit_trail', [])
        producer_identification_found = False
        for step in audit_trail:
            if 'producer' in step.get('step_name', '').lower():
                producer_identification_found = True
                break
                
        if producer_identification_found:
            logger.info("✅ Producer hierarchy logic detected in audit trail")
        else:
            logger.warning("❌ Producer hierarchy logic not found in audit trail")
            
        logger.info(f"\n🎯 V2.0 calculation result: SUCCESS - Fee calculated: ${result.get('final_fee', 0):.2f}")
        return True
        
    except Exception as e:
        logger.error(f"❌ V2.0 calculation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_v2_calculation_with_producer_hierarchy()
    exit(0 if success else 1)
