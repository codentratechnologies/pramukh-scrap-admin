from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from firebase import db
from datetime import datetime, timedelta
import jwt
import hashlib

router = APIRouter()

# Secret key to sign the JWTs (in production, use an environment variable)
SECRET_KEY = "pramukh_scrap_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 15

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
def login(request: LoginRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    admin_ref = db.child("users").child("admin").get()
    admin_data = admin_ref.val() if admin_ref else None
    
    # Hash incoming password exactly like the frontend did (SHA256)
    hashed_input_pwd = hashlib.sha256(request.password.encode('utf-8')).hexdigest()
    
    if not admin_data:
        # Initial Setup mimicking old logic
        initial_email = 'pramukhscrap36@gmail.com'
        initial_password_hash = hashlib.sha256('Pramukh@36'.encode('utf-8')).hexdigest()
        
        db.child("users").child("admin").set({
            "email": initial_email,
            "password": initial_password_hash
        })
        admin_data = {"email": initial_email, "password": initial_password_hash}
        
    if request.email != admin_data.get("email"):
        raise HTTPException(status_code=401, detail="Unauthorized user")
        
    if hashed_input_pwd != admin_data.get("password"):
        raise HTTPException(status_code=401, detail="Invalid password")
        
    # Generate Tokens
    access_token = create_access_token(
        data={"sub": request.email, "type": "access"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_access_token(
        data={"sub": request.email, "type": "refresh"},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
def refresh_token(request: RefreshRequest):
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        # Issue a new access token
        access_token = create_access_token(
            data={"sub": email, "type": "access"},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# Dependency to protect routes
def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
        
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
