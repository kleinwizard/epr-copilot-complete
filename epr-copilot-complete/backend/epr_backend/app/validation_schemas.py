from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

class MaterialValidationSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=50)
    weight: Decimal = Field(..., gt=0, decimal_places=4)
    recyclable: bool = False
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, v):
        if v <= 0:
            raise ValueError('Weight must be positive')
        return v

class FeeCalculationValidationSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    materials: List[MaterialValidationSchema] = Field(..., min_length=1, max_length=100)
    organization_id: str = Field(..., min_length=1)
    
    @field_validator('materials')
    @classmethod
    def validate_materials(cls, v):
        if not v:
            raise ValueError('At least one material is required')
        return v

class CSVUploadValidationSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    filename: str = Field(..., pattern=r'^.*\.(csv|CSV)$')
    content_type: str = Field(..., pattern=r'^text/csv$')
    size: int = Field(..., gt=0, le=10485760)  # 10MB limit
    
class ComplianceReportValidationSchema(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    period: str = Field(..., pattern=r'^\d{4}-Q[1-4]$')
    organization_id: str = Field(..., min_length=1)
    materials: List[MaterialValidationSchema] = Field(..., min_length=1)
    total_fee: Decimal = Field(..., ge=0, decimal_places=4)
