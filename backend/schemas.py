from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TokenBase(BaseModel):
    expires_at: datetime

class Token(TokenBase):
    id: int
    secret_key: str
    revoked: bool
    user_id: int
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    duration_hours: int = 24 # Default expiration

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    tokens: List[Token] = []

    class Config:
        from_attributes = True

class UserResponse(User):
    qr_code_base64: Optional[str] = None
    manual_entry_secret: Optional[str] = None

class AuditLogBase(BaseModel):
    action: str
    details: str

class AuditLog(AuditLogBase):
    id: int
    timestamp: datetime
    user_id: Optional[int] = None

    class Config:
        from_attributes = True
