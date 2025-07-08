from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
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
