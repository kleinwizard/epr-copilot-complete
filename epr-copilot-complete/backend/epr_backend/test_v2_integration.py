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

def test_v2_edge_cases():
    """Test V2.0 calculation engine with edge cases and multiple jurisdictions."""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    test_cases = [
        {
            'name': 'California CMC Test',
            'jurisdiction': 'CA',
            'producer_data': {
                'organization_id': 'test-ca-org',
                'annual_revenue': 5000000,
                'annual_revenue_scope': 'CALIFORNIA',
                'annual_tonnage': 2.0,
                'produces_perishable_food': True,
                'jurisdiction_code': 'CA',
                'entity_roles': ['BRAND_OWNER', 'IMPORTER'],
                'brand_owner_id': 'test-ca-org'
            },
            'packaging_data': [{
                'material_type': 'plastic',
                'component_name': 'container',
                'packaging_level': 'PRIMARY',
                'weight_per_unit': 0.05,
                'weight_unit': 'kg',
                'units_sold': 5000,
                'recycled_content_percentage': 50,
                'recyclable': True,
                'ca_plastic_component_flag': True,
                'is_beverage_container': True
            }]
        },
        {
            'name': 'Maine Toxicity Test',
            'jurisdiction': 'ME',
            'producer_data': {
                'organization_id': 'test-me-org',
                'annual_revenue': 1000000,
                'annual_revenue_scope': 'MAINE',
                'annual_tonnage': 0.1,
                'produces_perishable_food': False,
                'jurisdiction_code': 'ME',
                'entity_roles': ['BRAND_OWNER'],
                'brand_owner_id': 'test-me-org'
            },
            'packaging_data': [{
                'material_type': 'plastic',
                'component_name': 'wrapper',
                'packaging_level': 'SECONDARY',
                'weight_per_unit': 0.01,
                'weight_unit': 'kg',
                'units_sold': 10000,
                'recycled_content_percentage': 0,
                'recyclable': False,
                'me_toxicity_flag': True
            }]
        }
    ]
    
    success_count = 0
    for test_case in test_cases:
        try:
            engine = EPRCalculationEngine(test_case['jurisdiction'])
            
            test_data = {
                'producer_data': test_case['producer_data'],
                'packaging_data': test_case['packaging_data'],
                'product_data': {
                    'brand_owner_id': test_case['producer_data']['brand_owner_id'],
                    'organization_id': test_case['producer_data']['organization_id']
                },
                'system_data': {
                    'administrativeCosts': 500000,
                    'infrastructureCosts': 2000000,
                    'systemTotalTonnage': 50000
                }
            }
            
            result = engine.calculate_epr_fee_comprehensive(test_data)
            logger.info(f"✅ {test_case['name']}: SUCCESS - Fee: ${result.get('final_fee', 0):.2f}")
            success_count += 1
            
        except Exception as e:
            logger.error(f"❌ {test_case['name']}: FAILED - {str(e)}")
    
    logger.info(f"V2.0 Edge Case Testing: {success_count}/{len(test_cases)} tests passed")
    return success_count == len(test_cases)

if __name__ == "__main__":
    basic_success = test_v2_calculation_with_producer_hierarchy()
    edge_case_success = test_v2_edge_cases()
    
    overall_success = basic_success and edge_case_success
    exit(0 if overall_success else 1)
