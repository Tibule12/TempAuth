from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import pyotp
import os
# import qrcode
import io
import base64
from datetime import datetime, timedelta

import models, schemas, database
from database import engine

# --- Security Configuration ---
API_KEY = os.getenv("TEMP_AUTH_API_KEY", "dev_secret_key_123")
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials"
    )

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TempAuth API", dependencies=[Depends(get_api_key)])

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create_temp_user", response_model=schemas.UserResponse)
def create_temp_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Create User
    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 2. Generate TOTP Secret
    secret = pyotp.random_base32()
    
    # 3. Create Token record
    expiration = datetime.utcnow() + timedelta(hours=user.duration_hours)
    db_token = models.Token(
        secret_key=secret,
        expires_at=expiration,
        user_id=db_user.id
    )
    db.add(db_token)
    
    # Audit Log
    log = models.AuditLog(
        action="CREATE_USER_TOKEN",
        details=f"Created user {user.username} with token expiring at {expiration}",
        user_id=db_user.id
    )
    db.add(log)
    db.commit()

    # 4. Generate QR Code
    # otpauth://totp/TempAuth:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TempAuth
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="TempAuth")
    
    # QR Code generation skipped due to Python 3.14 incompatibility with Pillow
    # img = qrcode.make(otp_uri)
    # buffered = io.BytesIO()
    # img.save(buffered, format="PNG")
    # img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    img_str = "" # Placeholder

    # Construct response
    return schemas.UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        qr_code_base64=img_str,
        manual_entry_secret=secret
    )

@app.post("/revoke_user/{user_id}")
def revoke_user_tokens(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Revoke all tokens for this user
    tokens = db.query(models.Token).filter(models.Token.user_id == user_id, models.Token.revoked == False).all()
    for t in tokens:
        t.revoked = True
    
    user.is_active = False # Mark user as inactive
    
    log = models.AuditLog(
        action="REVOKE_USER",
        details=f"Revoked access for user {user.username}",
        user_id=user.id
    )
    db.add(log)
    db.commit()
    
    return {"message": f"Revoked {len(tokens)} tokens for user {user.username}"}

@app.get("/list_active_users", response_model=List[schemas.User])
def list_active_users(db: Session = Depends(get_db)):
    # Return users who are active
    users = db.query(models.User).filter(models.User.is_active == True).all()
    return users

@app.get("/audit_logs", response_model=List[schemas.AuditLog])
def get_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

@app.get("/")
def read_root():
    return {"message": "TempAuth API is running"}
