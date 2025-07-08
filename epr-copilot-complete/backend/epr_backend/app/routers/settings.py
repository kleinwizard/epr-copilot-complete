from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, HttpUrl
from ..database import get_db
from ..auth import get_current_user
from ..schemas import User as UserSchema
import uuid
import secrets

router = APIRouter(prefix="/api/settings", tags=["settings"])

class WebhookCreate(BaseModel):
    name: str
    url: HttpUrl
    events: List[str]

class ApiKeyCreate(BaseModel):
    name: str
    permissions: List[str]

@router.get("/webhooks")
async def get_webhooks(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get all webhooks for the user's organization.
    """
    try:
        mock_webhooks = [
            {
                "id": str(uuid.uuid4()),
                "name": "Production Webhook",
                "url": "https://api.example.com/webhooks/epr",
                "events": ["report.generated", "product.created", "fee.calculated"],
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_triggered": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Development Webhook",
                "url": "https://dev.example.com/webhooks/epr",
                "events": ["product.created", "product.updated"],
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_triggered": None
            }
        ]
        
        return {
            "success": True,
            "webhooks": mock_webhooks
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve webhooks: {str(e)}"
        )

@router.post("/webhooks")
async def create_webhook(
    webhook_data: WebhookCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new webhook for the user's organization.
    """
    try:
        new_webhook = {
            "id": str(uuid.uuid4()),
            "name": webhook_data.name,
            "url": str(webhook_data.url),
            "events": webhook_data.events,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_triggered": None
        }
        
        return {
            "success": True,
            "webhook": new_webhook,
            "message": "Webhook created successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create webhook: {str(e)}"
        )

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Delete a webhook.
    """
    try:
        return {
            "success": True,
            "message": f"Webhook {webhook_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete webhook: {str(e)}"
        )

@router.get("/api-keys")
async def get_api_keys(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get all API keys for the user's organization.
    """
    try:
        mock_api_keys = [
            {
                "id": str(uuid.uuid4()),
                "name": "Production API Key",
                "key_preview": "epr_live_****************************1234",
                "permissions": ["read", "write"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_used": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Development API Key",
                "key_preview": "epr_test_****************************5678",
                "permissions": ["read"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_used": None,
                "status": "active"
            }
        ]
        
        return {
            "success": True,
            "api_keys": mock_api_keys
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve API keys: {str(e)}"
        )

@router.post("/api-keys")
async def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Create a new API key for the user's organization.
    """
    try:
        api_key = f"epr_{'live' if 'write' in api_key_data.permissions else 'test'}_{secrets.token_urlsafe(32)}"
        
        new_api_key = {
            "id": str(uuid.uuid4()),
            "name": api_key_data.name,
            "key": api_key,
            "key_preview": f"{api_key[:12]}****************************{api_key[-4:]}",
            "permissions": api_key_data.permissions,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_used": None,
            "status": "active"
        }
        
        return {
            "success": True,
            "api_key": new_api_key,
            "message": "API key created successfully. Please save this key as it will not be shown again."
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create API key: {str(e)}"
        )

@router.delete("/api-keys/{api_key_id}")
async def delete_api_key(
    api_key_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Delete an API key.
    """
    try:
        return {
            "success": True,
            "message": f"API key {api_key_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete API key: {str(e)}"
        )

@router.get("/team-members")
async def get_team_members(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get team members for the user's organization.
    """
    try:
        mock_team_members = [
            {
                "id": str(uuid.uuid4()),
                "name": "John Doe",
                "email": "john.doe@example.com",
                "role": "Admin",
                "status": "Active",
                "avatar": None,
                "last_active": datetime.now(timezone.utc).isoformat(),
                "joined_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "role": "Member",
                "status": "Active",
                "avatar": None,
                "last_active": datetime.now(timezone.utc).isoformat(),
                "joined_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        return {
            "success": True,
            "team_members": mock_team_members
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve team members: {str(e)}"
        )

@router.get("/api-usage")
async def get_api_usage(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get API usage statistics for the user's organization.
    """
    try:
        mock_usage = {
            "requestsToday": 1250,
            "successRate": 98.5,
            "avgResponse": 145,
            "rateLimit": "1,000 requests/hour"
        }
        
        return {
            "success": True,
            **mock_usage
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve API usage: {str(e)}"
        )

@router.get("/usage-statistics")
async def get_usage_statistics(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get API usage statistics for the user's organization.
    """
    try:
        mock_usage = {
            "current_month": {
                "requests": 1250,
                "limit": 10000,
                "percentage": 12.5
            },
            "last_30_days": [
                {"date": "2024-01-01", "requests": 45},
                {"date": "2024-01-02", "requests": 52},
                {"date": "2024-01-03", "requests": 38},
                {"date": "2024-01-04", "requests": 61},
                {"date": "2024-01-05", "requests": 44}
            ],
            "top_endpoints": [
                {"endpoint": "/api/products", "requests": 450, "percentage": 36},
                {"endpoint": "/api/analytics", "requests": 320, "percentage": 25.6},
                {"endpoint": "/api/reports", "requests": 280, "percentage": 22.4},
                {"endpoint": "/api/fees", "requests": 200, "percentage": 16}
            ]
        }
        
        return {
            "success": True,
            "usage": mock_usage
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve usage statistics: {str(e)}"
        )
