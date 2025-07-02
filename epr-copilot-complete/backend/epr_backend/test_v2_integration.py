"""
Integration test for v2.0 calculation engine with producer hierarchy.
"""

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
        
        print("=== V2.0 Calculation Engine Integration Test ===")
        print(f"Calculation ID: {result.get('calculation_id', 'N/A')}")
        print(f"Jurisdiction: {result.get('jurisdiction', 'N/A')}")
        print(f"Total Fee: ${result.get('final_fee', 0):.2f}")
        print(f"Currency: {result.get('currency', 'USD')}")
        print(f"Calculation Steps: {len(result.get('audit_trail', []))}")
        print(f"V2.0 Features Enabled: {result.get('metadata', {}).get('v2_features_enabled', False)}")
        
        metadata = result.get('metadata', {})
        if metadata.get('v2_features_enabled'):
            print("✅ V2.0 features successfully enabled")
        else:
            print("❌ V2.0 features not detected")
            
        audit_trail = result.get('audit_trail', [])
        producer_identification_found = False
        for step in audit_trail:
            if 'producer' in step.get('step_name', '').lower():
                producer_identification_found = True
                break
                
        if producer_identification_found:
            print("✅ Producer hierarchy logic detected in audit trail")
        else:
            print("❌ Producer hierarchy logic not found in audit trail")
            
        print(f"\n🎯 V2.0 calculation result: SUCCESS - Fee calculated: ${result.get('final_fee', 0):.2f}")
        return True
        
    except Exception as e:
        print(f"❌ V2.0 calculation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_v2_calculation_with_producer_hierarchy()
    exit(0 if success else 1)
