"""
API Router for User CRUD endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models import Invite, User
from src.main.schemas import UserCreate, UserResponse
from src.main.utils import (
    get_current_user_from_token,
    hash_password,
    set_jwt_cookie_response,
)

router = APIRouter(tags=["Users"], prefix="/api/users")


@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate, db: Session = Depends(get_db), response: Response = None
):
    """
    Create a new user or register an existing unregistered user.

    Args:
        user (UserCreate): User creation payload.
        db (Session): Database session.
        response (Response): FastAPI response object (optional).

    Returns:
        UserResponse: The created or registered user details with JWT cookie set.

    Raises:
        HTTPException: If an account already exists for the email.
    """
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user and existing_user.is_registered == True:
        raise HTTPException(
            status_code=400, detail="An account already exists for this email."
        )

    # Register the user's account if email already exists in the DB
    if existing_user and existing_user.is_registered == False:
        existing_user.first_name = user.first_name
        existing_user.last_name = user.last_name
        existing_user.is_registered = True
        existing_user.hashed_password = hash_password(user.password)
        db.commit()
        db.refresh(existing_user)
        user_obj = existing_user

    # Otherwise, create a new user
    else:
        new_user = User(
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_registered=True,
            hashed_password=hash_password(user.password),
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user_obj = new_user

    # Backfill invites for this email
    invites = (
        db.query(Invite)
        .filter(Invite.email == user_obj.email, Invite.user_id == None)
        .all()
    )
    for invite in invites:
        invite.user_id = user_obj.id
    db.commit()

    # Sign in the user upon creation by setting the JWT cookie
    return set_jwt_cookie_response(user_obj, response_model=UserResponse)


@router.delete("/me", status_code=204)
def delete_current_user(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Delete the current user and their invites.

    Args:
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        None
    """
    # Delete invites by user_id or email
    db.query(Invite).filter(
        (Invite.user_id == user.id) | (Invite.email == user.email)
    ).delete(synchronize_session=False)
    db.commit()
    # Delete the current user from the database. Commit changes.
    db.delete(user)
    db.commit()
