from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal


class OrganizationBase(BaseModel):
    name: str


class OrganizationCreate(OrganizationBase):
    pass


class Organization(OrganizationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    role: str = "manager"


class UserCreate(UserBase):
    password: str
    organization_id: str


class User(UserBase):
    id: str
    organization_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    weight: Optional[float] = 0.0
    status: Optional[str] = "Active"
    description: Optional[str] = None
    upc: Optional[str] = None
    manufacturer: Optional[str] = None
    epr_fee: Optional[float] = 0.0
    designated_producer_id: Optional[str] = None
    materials: Optional[List[dict]] = []
    last_updated: Optional[datetime] = None


class ProductCreate(ProductBase):
    class Config:
        str_strip_whitespace = True
        validate_assignment = True
        
    def dict(self, **kwargs):
        data = super().dict(**kwargs)
        if 'designatedProducerId' in data:
            data['designated_producer_id'] = data.pop('designatedProducerId')
        return data


class Product(ProductBase):
    id: str
    organization_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class MaterialBase(BaseModel):
    name: str
    epr_rate: Optional[Decimal] = None
    recyclable: bool = False


class MaterialCreate(MaterialBase):
    class Config:
        str_strip_whitespace = True
        validate_assignment = True
        
    @field_validator('recyclable', mode='before')
    @classmethod
    def validate_recyclable(cls, v):
        if isinstance(v, str):
            if v.lower() in ['true', '1', 'yes', 'on']:
                return True
            elif v.lower() in ['false', '0', 'no', 'off', '']:
                return False
        return v


class Material(MaterialBase):
    id: str

    class Config:
        from_attributes = True


class ReportBase(BaseModel):
    type: Optional[str] = None
    period: Optional[str] = None
    status: str = "draft"
    total_fee: Optional[Decimal] = None


class ReportCreate(ReportBase):
    organization_id: str


class Report(ReportBase):
    id: str
    organization_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class FileUpload(BaseModel):
    id: str
    name: str
    size: int
    url: str
    uploadedAt: str
    content_type: Optional[str] = None


class SavedSearchBase(BaseModel):
    name: str
    criteria: dict


class SavedSearchCreate(SavedSearchBase):
    pass


class SavedSearch(SavedSearchBase):
    id: str
    organization_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyProfileBase(BaseModel):
    name: str
    legal_name: Optional[str] = None
    business_id: Optional[str] = None
    deq_number: Optional[str] = None
    naics_code: Optional[str] = None
    entity_type: Optional[str] = None
    description: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


class CompanyProfileCreate(CompanyProfileBase):
    pass


class CompanyProfile(CompanyProfileBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CompanyProfileForm(BaseModel):
    legalName: str
    dbaName: Optional[str] = None
    businessId: str
    deqNumber: Optional[str] = None
    naicsCode: Optional[str] = None
    entityType: Optional[str] = None
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    zipCode: str

    def to_backend_fields(self) -> Dict[str, Any]:
        """Convert camelCase frontend fields to snake_case backend fields"""
        return {
            'name': self.legalName,
            'legal_name': self.legalName,
            'dba_name': self.dbaName,
            'business_id': self.businessId,
            'deq_number': self.deqNumber,
            'naics_code': self.naicsCode,
            'entity_type': self.entityType,
            'description': self.description,
            'street_address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zipCode
        }


class ProductForm(BaseModel):
    name: str
    sku: str
    category: Optional[str] = None
    weight: Optional[float] = 0.0
    status: Optional[str] = "Active"
    description: Optional[str] = None
    upc: Optional[str] = None
    manufacturer: Optional[str] = None
    eprFee: Optional[float] = 0.0
    designatedProducerId: Optional[str] = None
    materials: Optional[List[dict]] = []
    lastUpdated: Optional[datetime] = None

    def to_backend_fields(self) -> Dict[str, Any]:
        """Convert camelCase frontend fields to snake_case backend fields"""
        return {
            'name': self.name,
            'sku': self.sku,
            'category': self.category,
            'weight': self.weight,
            'status': self.status,
            'description': self.description,
            'upc': self.upc,
            'manufacturer': self.manufacturer,
            'epr_fee': self.eprFee,
            'designated_producer_id': self.designatedProducerId,
            'materials': self.materials,
            'last_updated': self.lastUpdated
        }


class MaterialForm(BaseModel):
    name: str
    eprRate: Optional[float] = None
    recyclable: bool = False

    def to_backend_fields(self) -> Dict[str, Any]:
        """Convert camelCase frontend fields to snake_case backend fields"""
        return {
            'name': self.name,
            'epr_rate': self.eprRate,
            'recyclable': self.recyclable
        }
