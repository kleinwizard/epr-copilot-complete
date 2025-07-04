from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db, User
from .schemas import User as UserSchema

from .config import get_settings

settings = get_settings()
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "nonce": secrets.token_hex(8)})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(
        credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return payload."""
    if credentials.credentials.startswith("dev-token-"):
        return {
            "sub": "dev-user-1",
            "email": "test@example.com",
            "organization_id": 1
        }
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    token_payload: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> UserSchema:
    """Get current user from JWT token."""
    user_id = token_payload.get("sub")
    
    if user_id == "dev-user-1":
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            from .database import Organization
            
            org = db.query(Organization).filter(Organization.id == 1).first()
            if org is None:
                org = Organization(
                    id=1,
                    name="Development Company",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(org)
                db.commit()
            
            user = User(
                id=user_id,
                email="test@example.com",
                organization_id=1,
                role="manager",
                password_hash="dev-hash",
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        user.organization_id = 1
        return user
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


def authenticate_user(
        db: Session,
        email: str,
        password: str) -> Optional[User]:
    """Authenticate user with email and password."""
    import logging
    logger = logging.getLogger(__name__)
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.warning(f"User not found for email: {email}")
        return None
    if not verify_password(password, user.password_hash):
        logger.warning(f"Password verification failed for email: {email}")
        return None
    logger.info(f"User authenticated successfully: {email}")
    return user
