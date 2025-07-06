from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from ..database import get_db
from ..auth import get_current_user
from ..services.email_service import email_service

router = APIRouter(prefix="/api/team", tags=["team"])


class TeamInvitationRequest(BaseModel):
    email: EmailStr
    role: str
    department: str


class TeamInvitation(BaseModel):
    id: str
    email: str
    role: str
    department: str
    invitedBy: str
    invitedDate: str
    status: str


class TeamMember(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    status: str
    lastActive: str
    joinedDate: str


@router.get("/members")
async def get_team_members(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[TeamMember]:
    """Get all team members for the current organization."""
    try:
        if not current_user.organization_id:
            return []
        
        mock_members = [
            TeamMember(
                id="1",
                name=current_user.email.split('@')[0].replace('.', ' ').title(),
                email=current_user.email,
                role="admin",
                department="Management",
                status="active",
                lastActive=datetime.now(timezone.utc).isoformat(),
                joinedDate=datetime.now(timezone.utc).isoformat()
            )
        ]
        
        return mock_members
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve team members: {str(e)}"
        )


@router.get("/invitations")
async def get_team_invitations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[TeamInvitation]:
    """Get all pending team invitations for the current organization."""
    try:
        if not current_user.organization_id:
            return []
        
        return []
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve team invitations: {str(e)}"
        )


@router.post("/invitations")
async def send_team_invitation(
    request: TeamInvitationRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Send a team invitation email."""
    try:
        if not current_user.organization_id:
            raise HTTPException(
                status_code=400,
                detail="User must be part of an organization to send invitations"
            )
        
        invitation_token = f"inv_{int(datetime.now().timestamp())}_{current_user.organization_id}"
        invitation_link = f"https://app.epr-copilot.com/invite?token={invitation_token}&email={request.email}"
        
        success = await email_service.send_invitation_email(
            to_email=request.email,
            inviter_name=current_user.email.split('@')[0].replace('.', ' ').title(),
            organization_name=current_user.organization.name if current_user.organization else "Your Organization",
            invitation_link=invitation_link
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to send invitation email"
            )
        
        invitation_id = f"inv_{int(datetime.now().timestamp())}"
        
        return {
            "success": True,
            "invitation": {
                "id": invitation_id,
                "email": request.email,
                "role": request.role,
                "department": request.department,
                "invitedBy": current_user.email.split('@')[0].replace('.', ' ').title(),
                "invitedDate": datetime.now(timezone.utc).isoformat(),
                "status": "pending"
            },
            "message": f"Invitation sent successfully to {request.email}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send team invitation: {str(e)}"
        )


@router.get("/stats")
async def get_team_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get team statistics for the current organization."""
    try:
        if not current_user.organization_id:
            return {
                "totalMembers": 0,
                "activeMembers": 0,
                "pendingInvitations": 0,
                "roles": {"admin": 0, "manager": 0, "user": 0, "viewer": 0}
            }
        
        return {
            "totalMembers": 1,
            "activeMembers": 1,
            "pendingInvitations": 0,
            "roles": {"admin": 1, "manager": 0, "user": 0, "viewer": 0}
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve team stats: {str(e)}"
        )
