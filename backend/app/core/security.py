from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Dict
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password.encode("utf-8")[:72], salt)
    return hashed.decode("utf-8")

def create_access_token(
    subject: Union[str, Any], 
    tenant_id: Optional[str] = None,
    org_id: Optional[str] = None,
    branch_id: Optional[str] = None,
    role: Optional[str] = None,
    permissions: Optional[list] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
        "tenant_id": tenant_id,
        "org_id": org_id,
        "branch_id": branch_id,
        "role": role,
        "permissions": permissions or []
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(
    subject: Union[str, Any], 
    tenant_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
        "tenant_id": tenant_id
    }
    return jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str, is_refresh: bool = False) -> Dict[str, Any]:
    key = settings.REFRESH_SECRET_KEY if is_refresh else settings.SECRET_KEY
    return jwt.decode(token, key, algorithms=[settings.ALGORITHM])
