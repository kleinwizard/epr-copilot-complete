"""Communication and messaging endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from uuid import UUID
import uuid

from ..database import get_db
from ..auth import get_current_user
from ..schemas import User as UserSchema

router = APIRouter(prefix="/api/messages", tags=["messages"])

messages_store = []
conversations_store = []

@router.get("")
async def get_messages(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> Dict[str, Any]:
    """Get messages for the current user."""
    try:
        user_messages = [
            msg for msg in messages_store
            if msg["senderId"] == str(current_user.id) or msg["recipientId"] == str(current_user.id)
        ]
        
        user_messages.sort(key=lambda x: x["timestamp"], reverse=True)
        
        paginated_messages = user_messages[offset:offset + limit]
        
        return {
            "messages": paginated_messages,
            "total": len(user_messages),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")

@router.post("")
async def send_message(
    message_data: Dict[str, Any],
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Send a new message."""
    try:
        new_message = {
            "id": str(uuid.uuid4()),
            "senderId": str(current_user.id),
            "senderName": current_user.full_name or current_user.email,
            "recipientId": message_data["recipientId"],
            "recipientName": message_data["recipientName"],
            "subject": message_data["subject"],
            "content": message_data["content"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "sent",
            "priority": message_data.get("priority", "medium"),
            "attachments": message_data.get("attachments", [])
        }
        
        messages_store.append(new_message)
        
        conversation_id = _update_conversation(new_message, str(current_user.id))
        
        return {
            "message": new_message,
            "conversationId": conversation_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/unread")
async def get_unread_messages(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get unread messages for the current user."""
    try:
        unread_messages = [
            msg for msg in messages_store
            if msg["recipientId"] == str(current_user.id) and msg["status"] != "read"
        ]
        
        unread_messages.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "messages": unread_messages,
            "count": len(unread_messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch unread messages: {str(e)}")

@router.put("/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Mark a message as read."""
    try:
        message = next((msg for msg in messages_store if msg["id"] == message_id), None)
        
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")
        
        if message["recipientId"] != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this message")
        
        message["status"] = "read"
        
        return {"success": True, "message": "Message marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update message: {str(e)}")

@router.get("/stats")
async def get_communication_stats(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get communication statistics for the current user."""
    try:
        user_id = str(current_user.id)
        today = datetime.now(timezone.utc).date()
        
        total_messages = len([m for m in messages_store if m["senderId"] == user_id or m["recipientId"] == user_id])
        unread_messages = len([m for m in messages_store if m["recipientId"] == user_id and m["status"] != "read"])
        
        messages_sent_today = len([
            m for m in messages_store 
            if m["senderId"] == user_id and 
            datetime.fromisoformat(m["timestamp"].replace('Z', '+00:00')).date() == today
        ])
        
        messages_received_today = len([
            m for m in messages_store 
            if m["recipientId"] == user_id and 
            datetime.fromisoformat(m["timestamp"].replace('Z', '+00:00')).date() == today
        ])
        
        active_conversations = len([
            c for c in conversations_store 
            if user_id in c["participants"]
        ])
        
        return {
            "totalMessages": total_messages,
            "unreadMessages": unread_messages,
            "activeConversations": active_conversations,
            "messagesSentToday": messages_sent_today,
            "messagesReceivedToday": messages_received_today
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

def _update_conversation(message: Dict[str, Any], user_id: str) -> str:
    """Update or create conversation based on message."""
    participants = sorted([message["senderId"], message["recipientId"]])
    
    conversation = next(
        (c for c in conversations_store if sorted(c["participants"]) == participants),
        None
    )
    
    if conversation:
        conversation["lastMessage"] = message
        conversation["updatedAt"] = message["timestamp"]
        return conversation["id"]
    else:
        new_conversation = {
            "id": str(uuid.uuid4()),
            "participants": participants,
            "participantNames": [message["senderName"], message["recipientName"]],
            "lastMessage": message,
            "unreadCount": 1 if message["recipientId"] != user_id else 0,
            "createdAt": message["timestamp"],
            "updatedAt": message["timestamp"]
        }
        conversations_store.append(new_conversation)
        return new_conversation["id"]

@router.get("/conversations")
async def get_conversations(
    current_user: UserSchema = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get conversations for the current user."""
    try:
        user_conversations = [
            c for c in conversations_store
            if str(current_user.id) in c["participants"]
        ]
        
        user_conversations.sort(key=lambda x: x["updatedAt"], reverse=True)
        
        return {
            "conversations": user_conversations,
            "total": len(user_conversations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversations: {str(e)}")
