"""
Helper functions for implementing authentication
"""

import os
from typing import Annotated, Optional

import bcrypt
from fastapi import Cookie, Depends, HTTPException
from fastapi.responses import JSONResponse
from jose import JWTError, jwt
from jose.constants import ALGORITHMS
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models import User
from src.main.schemas import UserRequest

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is not set.")


def hash_password(plain_password) -> str:
    """
    Hashes a password
    """

    return bcrypt.hashpw(
        plain_password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain_password, hash_password) -> bool:
    """
    Checks if a plain-text password matches a hashed password stored in the
    database. Used during user login to verify credentials.
    """

    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hash_password.encode("utf-8")
    )


def generate_jwt_token(user: UserRequest) -> str:
    """
    Generates a new JWT token using the user's information, including their
    role.
    """

    payload = {"sub": user.email}
    # Only add role if present
    if hasattr(user, "role") and user.role is not None:
        payload["role"] = user.role
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHMS.HS256)
    return token


def decode_jwt_token(token: str) -> Optional[dict]:
    """
    Decodes a JWT token and returns the payload if valid, otherwise returns
    None.
    """

    try:
        payload = jwt.decode(
            token, JWT_SECRET_KEY, algorithms=[ALGORITHMS.HS256]
        )
        return payload
    except JWTError:
        return None


def get_jwt_user_data(
    fast_api_token: Annotated[Optional[str], Cookie()] = None,
) -> Optional[dict]:
    """
    Dependency to extract user data from JWT in the cookie. Returns the JWT
    payload dict if valid, else None.
    """

    if not fast_api_token:
        return None
    payload = decode_jwt_token(fast_api_token)
    if not payload:
        return None
    return payload


def get_current_user_from_token(
    db: Session = Depends(get_db),
    jwt_payload: dict = Depends(get_jwt_user_data),
) -> Optional[User]:
    """
    Dependency to get the current User object from the JWT token in the cookie.
    Returns the User if authenticated, else raises HTTPException.
    """
    if not jwt_payload or "sub" not in jwt_payload:
        raise HTTPException(status_code=404, detail="Not logged in")
    user = db.query(User).filter(User.email == jwt_payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Not logged in")
    return user


def require_admin(jwt_payload: dict = Depends(get_jwt_user_data)):
    """
    Dependency to require admin role. Raises HTTP 403 Forbidden if the user
    is not an admin.
    """

    if not jwt_payload or jwt_payload.get("role") != "admin":
        raise HTTPException(
            status_code=403, detail="Admin privileges required"
        )
    return jwt_payload


def set_jwt_cookie_response(user, response_model=None, custom_content=None):
    """
    Sets the JWT cookie in the response. Supports custom content for JSON
    serialization.
    """

    class UserObj:
        def __init__(self, email, role=None):
            self.email = email
            self.role = role

    role = getattr(user, "role", None)
    jwt_token = generate_jwt_token(UserObj(user.email, role))
    if custom_content is not None:
        content = custom_content
    elif response_model:
        content = response_model.model_validate(user).model_dump()
    else:
        content = {}
    response = JSONResponse(content=content)
    response.set_cookie(
        key="fast_api_token", value=jwt_token, httponly=True, samesite="lax"
    )
    return response
