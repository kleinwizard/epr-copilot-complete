import pytest
from decimal import Decimal
from unittest.mock import Mock
from sqlalchemy.orm import Session

from app.calculation_engine import EPRCalculationEngine
from app.calculation_strategies import (
    OregonFeeCalculationStrategy,
    CaliforniaFeeCalculationStrategy,
    ColoradoFeeCalculationStrategy,
    MaineFeeCalculationStrategy,
    SharedResponsibilityStrategy
)


class TestJurisdictionCalculations:
    """Test suite for jurisdiction-specific EPR fee calculations."""
    
    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return Mock(spec=Session)

    def test_oregon_strategy_initialization(self):
        """Test Oregon strategy can be initialized and has correct jurisdiction."""
        strategy = OregonFeeCalculationStrategy()
        assert strategy.jurisdiction_code == 'OR'
        
    def test_california_strategy_initialization(self):
        """Test California strategy can be initialized and has correct jurisdiction."""
        strategy = CaliforniaFeeCalculationStrategy()
        assert strategy.jurisdiction_code == 'CA'
        
    def test_colorado_strategy_initialization(self):
        """Test Colorado strategy can be initialized and has correct jurisdiction."""
        strategy = ColoradoFeeCalculationStrategy()
        assert strategy.jurisdiction_code == 'CO'
        
    def test_maine_strategy_initialization(self):
        """Test Maine strategy can be initialized and has correct jurisdiction."""
        strategy = MaineFeeCalculationStrategy()
        assert strategy.jurisdiction_code == 'ME'
        
    def test_shared_responsibility_strategy_initialization(self):
        """Test SharedResponsibility strategy can be initialized."""
        strategy = SharedResponsibilityStrategy('MD')
        assert strategy.jurisdiction_code == 'MD'
        assert strategy.state_code == 'MD'

    def test_calculation_engine_oregon_strategy_selection(self, mock_db):
        """Test that calculation engine selects Oregon strategy correctly."""
        engine = EPRCalculationEngine('OR', mock_db)
        assert isinstance(engine.strategy, OregonFeeCalculationStrategy)
        assert engine.jurisdiction_code == 'OR'
        
    def test_calculation_engine_california_strategy_selection(self, mock_db):
        """Test that calculation engine selects California strategy correctly."""
        engine = EPRCalculationEngine('CA', mock_db)
        assert isinstance(engine.strategy, CaliforniaFeeCalculationStrategy)
        assert engine.jurisdiction_code == 'CA'
        
    def test_calculation_engine_colorado_strategy_selection(self, mock_db):
        """Test that calculation engine selects Colorado strategy correctly."""
        engine = EPRCalculationEngine('CO', mock_db)
        assert isinstance(engine.strategy, ColoradoFeeCalculationStrategy)
        assert engine.jurisdiction_code == 'CO'
        
    def test_calculation_engine_maine_strategy_selection(self, mock_db):
        """Test that calculation engine selects Maine strategy correctly."""
        engine = EPRCalculationEngine('ME', mock_db)
        assert isinstance(engine.strategy, MaineFeeCalculationStrategy)
        assert engine.jurisdiction_code == 'ME'
        
    def test_calculation_engine_maryland_strategy_selection(self, mock_db):
        """Test that calculation engine selects SharedResponsibility strategy for Maryland."""
        engine = EPRCalculationEngine('MD', mock_db)
        assert isinstance(engine.strategy, SharedResponsibilityStrategy)
        assert engine.jurisdiction_code == 'MD'
        assert engine.strategy.state_code == 'MD'
        
    def test_calculation_engine_minnesota_strategy_selection(self, mock_db):
        """Test that calculation engine selects SharedResponsibility strategy for Minnesota."""
        engine = EPRCalculationEngine('MN', mock_db)
        assert isinstance(engine.strategy, SharedResponsibilityStrategy)
        assert engine.jurisdiction_code == 'MN'
        assert engine.strategy.state_code == 'MN'
        
    def test_calculation_engine_washington_strategy_selection(self, mock_db):
        """Test that calculation engine selects SharedResponsibility strategy for Washington."""
        engine = EPRCalculationEngine('WA', mock_db)
        assert isinstance(engine.strategy, SharedResponsibilityStrategy)
        assert engine.jurisdiction_code == 'WA'
        assert engine.strategy.state_code == 'WA'

    def test_calculation_engine_unsupported_jurisdiction(self, mock_db):
        """Test that calculation engine raises error for unsupported jurisdiction."""
        with pytest.raises(ValueError, match="Unsupported jurisdiction: XX"):
            EPRCalculationEngine('XX', mock_db)

    def test_oregon_small_producer_exemption(self):
        """Test Oregon small producer exemption logic."""
        strategy = OregonFeeCalculationStrategy()
        
        small_producer_data = {
            'annual_revenue': Decimal('4000000.00'),
            'annual_tonnage': Decimal('0.8')
        }
        
        result = strategy.is_small_producer(small_producer_data)
        assert result == True
        
        large_producer_data = {
            'annual_revenue': Decimal('6000000.00'),
            'annual_tonnage': Decimal('0.8')
        }
        
        result = strategy.is_small_producer(large_producer_data)
        assert result == False

    def test_california_small_producer_exemption(self):
        """Test California small producer exemption logic."""
        strategy = CaliforniaFeeCalculationStrategy()
        
        small_producer_data = {
            'annual_revenue': Decimal('800000.00'),
            'annual_tonnage': Decimal('5.0')
        }
        
        result = strategy.is_small_producer(small_producer_data)
        assert result == True
        
        large_producer_data = {
            'annual_revenue': Decimal('1200000.00'),
            'annual_tonnage': Decimal('5.0')
        }
        
        result = strategy.is_small_producer(large_producer_data)
        assert result == False

    def test_small_producer_thresholds(self):
        """Test that small producer thresholds are correctly defined."""
        strategy = OregonFeeCalculationStrategy()
        
        thresholds = strategy.get_small_producer_thresholds()
        assert 'revenue_threshold' in thresholds
        assert 'tonnage_threshold' in thresholds
        assert thresholds['revenue_threshold'] == Decimal('5000000')
        assert thresholds['tonnage_threshold'] == Decimal('1.0')

    def test_weight_standardization_precision(self):
        """Test that weight standardization maintains high precision."""
        strategy = OregonFeeCalculationStrategy()
        
        test_cases = [
            (Decimal('1.0'), 'kg', Decimal('1.0')),
            (Decimal('1000.0'), 'g', Decimal('1.0')),
            (Decimal('2.20462'), 'lb', Decimal('1.0')),
            (Decimal('35.274'), 'oz', Decimal('1.0'))
        ]
        
        for weight, unit, expected_kg in test_cases:
            result = strategy.standardize_weight_to_kg(weight, unit)
            assert abs(result - expected_kg) < Decimal('0.001')

    def test_currency_precision_rounding(self):
        """Test that currency amounts are properly rounded."""
        strategy = OregonFeeCalculationStrategy()
        
        test_amounts = [
            (Decimal('123.456'), Decimal('123.46')),
            (Decimal('123.454'), Decimal('123.45')),
            (Decimal('123.455'), Decimal('123.46'))  # Banker's rounding
        ]
        
        for input_amount, expected in test_amounts:
            result = strategy.round_to_currency_precision(input_amount)
            assert result == expected

    def test_eco_modulation_application(self):
        """Test that eco-modulation rules are properly applied."""
        strategy = OregonFeeCalculationStrategy()
        
        report_data = {
            'producer_data': {
                'has_lca_disclosure': True,
                'has_environmental_impact_reduction': False,
                'uses_reusable_packaging': False
            }
        }
        
        base_fee = Decimal('100.00')
        result = strategy.apply_eco_modulation(base_fee, report_data)
        
        expected_fee = base_fee * Decimal('0.95')  # 5% discount
        assert result == expected_fee

    def test_calculation_id_uniqueness(self, mock_db):
        """Test that calculation IDs are unique across multiple calculations."""
        engine = EPRCalculationEngine('OR', mock_db)
        
        ids = set()
        for _ in range(10):
            calc_id = engine._generate_calculation_id()
            assert calc_id not in ids
            ids.add(calc_id)

    def test_zero_weight_edge_case(self):
        """Test handling of zero weight packaging components."""
        strategy = OregonFeeCalculationStrategy()
        
        zero_weight = Decimal('0.0')
        unit = 'kg'
        
        result = strategy.standardize_weight_to_kg(zero_weight, unit)
        assert result == Decimal('0.0')

    def test_large_volume_calculations(self):
        """Test calculations with very large volumes."""
        strategy = OregonFeeCalculationStrategy()
        
        large_weight = Decimal('1000000.0')  # 1 million kg
        unit = 'kg'
        
        result = strategy.standardize_weight_to_kg(large_weight, unit)
        
        assert result == Decimal('1000000.0')
        assert isinstance(result, Decimal)

    def test_data_validation(self):
        """Test that data validation works correctly."""
        strategy = OregonFeeCalculationStrategy()
        
        valid_producer_data = {
            'organization_id': 'test-org',
            'annual_revenue': Decimal('5000000'),
            'annual_tonnage': Decimal('10.5')
        }
        
        errors = strategy.validate_producer_data(valid_producer_data)
        assert len(errors) == 0
        
        invalid_producer_data = {
            'organization_id': 'test-org'
        }
        
        errors = strategy.validate_producer_data(invalid_producer_data)
        assert len(errors) > 0
        assert any('annual_revenue' in error for error in errors)
        assert any('annual_tonnage' in error for error in errors)
