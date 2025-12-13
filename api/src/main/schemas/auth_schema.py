"""
Pydantic models for user authentication and authorization.

Contains schemas for user registration, login, JWT token handling, and related
authentication flows. These models are used for validating and serializing
authentication-related data, separate from user profile and database models.
"""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """
    Represents a JWT access token returned after successful authentication.
    """

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Represents the data extracted from a JWT token (e.g., for validation).
    """

    role: Optional[str] = None
    username: Optional[str] = None
