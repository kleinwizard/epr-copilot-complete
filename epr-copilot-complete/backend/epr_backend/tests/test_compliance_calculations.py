import pytest
from decimal import Decimal
from app.routers.fees import calculate_epr_fee
from app.database import Organization, User, Product, Material


class TestComplianceCalculations:
    """Test EPR compliance calculations for legal accuracy"""
    
    def test_basic_fee_calculation_decimal_precision(self):
        """Test that fee calculations use Decimal type with 4 decimal places"""
        weight = Decimal('100.0000')  # 100kg
        rate = Decimal('0.1250')      # $0.125 per kg
        
        expected_fee = Decimal('12.5000')  # 100 * 0.125 = 12.5000
        
        actual_fee = calculate_epr_fee(weight, rate)
        assert actual_fee == expected_fee
        assert isinstance(actual_fee, Decimal)
        
        assert str(actual_fee) == '12.5000'
    
    def test_zero_weight_edge_case(self):
        """Test fee calculation with zero weight"""
        weight = Decimal('0.0000')
        rate = Decimal('0.1250')
        
        fee = calculate_epr_fee(weight, rate)
        assert fee == Decimal('0.0000')
    
    def test_negative_weight_validation(self):
        """Test that negative weights are rejected"""
        weight = Decimal('-10.0000')
        rate = Decimal('0.1250')
        
        with pytest.raises(ValueError):
            calculate_epr_fee(weight, rate)
    
    def test_extremely_large_weight(self):
        """Test fee calculation with extremely large weight values"""
        weight = Decimal('999999999.9999')  # Nearly 1 billion kg
        rate = Decimal('0.0001')            # Very small rate
        
        expected_fee = Decimal('100000.0000')
        
        fee = calculate_epr_fee(weight, rate)
        assert fee == expected_fee
        assert isinstance(fee, Decimal)
    
    def test_banker_rounding_consistency(self):
        """Test that banker's rounding is used consistently"""
        test_cases = [
            (Decimal('10.12345'), Decimal('1.0000'), Decimal('10.1234')),  # Banker's rounding: 5 after even digit rounds down
            (Decimal('10.12355'), Decimal('1.0000'), Decimal('10.1236')),  # Banker's rounding: 5 after odd digit rounds up
        ]
        
        for weight, rate, expected in test_cases:
            fee = calculate_epr_fee(weight, rate)
            assert fee == expected
    
    def test_multiple_material_types(self):
        """Test fee calculations across different material types"""
        materials = [
            ('plastic', Decimal('0.1500')),
            ('glass', Decimal('0.0800')),
            ('metal', Decimal('0.2000')),
            ('paper', Decimal('0.0500')),
        ]
        
        weight = Decimal('100.0000')
        
        for material_type, rate in materials:
            fee = calculate_epr_fee(weight, rate, material_type=material_type)
            expected = weight * rate
            assert fee == expected
            assert isinstance(fee, Decimal)
    
    def test_volume_discount_logic(self):
        """Test volume discount calculations - P0 critical untested logic"""
        large_weight = Decimal('10000.0000')  # 10 tons
        base_rate = Decimal('0.1000')
        
        fee_with_discount = calculate_epr_fee(large_weight, base_rate, apply_volume_discount=True)
        fee_without_discount = calculate_epr_fee(large_weight, base_rate, apply_volume_discount=False)
        
        assert fee_with_discount < fee_without_discount
        assert isinstance(fee_with_discount, Decimal)
        assert isinstance(fee_without_discount, Decimal)
        
        expected_discount = fee_without_discount * Decimal('0.05')
        expected_discounted_fee = fee_without_discount - expected_discount
        assert fee_with_discount == expected_discounted_fee
    
    def test_audit_trail_generation(self):
        """Test that all calculations generate audit trails"""
        weight = Decimal('100.0000')
        rate = Decimal('0.1250')
        
        fee, audit_log = calculate_epr_fee(weight, rate, generate_audit=True)
        
        assert audit_log is not None
        assert 'weight' in audit_log
        assert 'rate' in audit_log
        assert 'calculated_fee' in audit_log
        assert 'timestamp' in audit_log
        assert 'rounding_method' in audit_log
        assert 'precision' in audit_log
        
        assert audit_log['weight'] == str(weight)
        assert audit_log['rate'] == str(rate)
        assert audit_log['calculated_fee'] == str(fee)
        assert audit_log['rounding_method'] == 'ROUND_HALF_EVEN'
        assert audit_log['precision'] == '4_decimal_places'
