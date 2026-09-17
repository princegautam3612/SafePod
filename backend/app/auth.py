from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from .core import settings

passwords = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()
def token_for(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": user_id, "iat": now, "exp": now + timedelta(minutes=30), "iss": settings().jwt_issuer}, settings().jwt_secret, algorithm="HS256")
def current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    try:
        claims = jwt.decode(credentials.credentials, settings().jwt_secret, algorithms=["HS256"], issuer=settings().jwt_issuer)
        return claims["sub"]
    except jwt.PyJWTError: raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
