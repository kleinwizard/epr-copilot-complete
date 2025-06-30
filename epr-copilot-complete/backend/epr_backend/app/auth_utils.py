from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
from jose import jwt

def create_refresh_token(data: dict, secret_key: str, algorithm: str = "HS256"):
    """Create a JWT refresh token with unique nonce."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "nonce": secrets.token_hex(8)})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt
