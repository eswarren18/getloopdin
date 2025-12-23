import os
import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models.event import Event, Participant
from src.main.models.invite import Invite
from src.main.models.user import User
from src.main.schemas.invite_schema import (
    InviteCreate,
    InviteOut,
    InviteStatusUpdate,
)
from src.main.utils import (
    get_current_user_from_token,
    send_invite_email,
    serialize_inviteout,
)

router = APIRouter(tags=["Invites"], prefix="/api/invites")


@router.post(
    "/",
    response_model=InviteOut,
    summary="Invite a participant",
)
def create_invite(
    invite_details: InviteCreate = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Create a new invite for a participant to an event.

    Args:
        invite_details (InviteCreate): Invite details from request body, including event_id, email, and role.
        db (Session): Database session.
        user (User): Current authenticated user (host).

    Returns:
        InviteOut: The created invite object.

    Raises:
        HTTPException: If not authorized or invite already exists.
    """
    # Fetch event from the DB
    event = db.query(Event).filter(Event.id == invite_details.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    is_host = (
        db.query(Participant)
        .filter(
            Participant.event_id == invite_details.event_id,
            Participant.user_id == user.id,
            Participant.role == "host",
        )
        .first()
    )
    if not is_host:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Handle if an invite has already been sent
    existing_invite = (
        db.query(Invite)
        .filter(
            Invite.event_id == invite_details.event_id,
            Invite.email == invite_details.email,
        )
        .first()
    )
    if existing_invite:
        raise HTTPException(
            status_code=400,
            detail="An invitation has already been sent.",
        )

    # Fetch the user from the DB if registered
    invited_user = (
        db.query(User).filter(User.email == invite_details.email).first()
    )

    # Create the invite
    new_invite = Invite(
        event_id=invite_details.event_id,
        email=invite_details.email,
        role=invite_details.role,
        token=str(uuid.uuid4()),
        user_id=invited_user.id if invited_user else None,
    )
    db.add(new_invite)
    db.commit()
    db.refresh(new_invite)

    # Send invite email with clickable link to the event
    event_link = f"{os.environ.get('UI_URL', 'http://localhost')}/events/token/{new_invite.token}"
    register_link = f"{os.environ.get('UI_URL', 'http://localhost')}/signup?email={invite_details.email}"
    send_invite_email(
        invite_details.email, event.title, event_link, register_link
    )

    return serialize_inviteout(new_invite, db)


@router.put(
    "/{token}",
    response_model=InviteOut,
    summary="Respond to an invite (accept or decline)",
)
def update_invite(
    token: str,
    status_update: InviteStatusUpdate = Body(
        ..., examples={"status": "accepted"}
    ),
    db: Session = Depends(get_db),
):
    """
    Respond to an invite by accepting or declining.

    Args:
        token (str): Invite token from the URL.
        status_update (InviteStatusUpdate): Status update payload.
        db (Session): Database session.

    Returns:
        InviteOut: The updated invite object.

    Raises:
        HTTPException: If invite is invalid or status is invalid.
    """
    # Fetch invite from DB
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(
            status_code=404, detail="Invalid or expired invite."
        )

    # Fetch user from DB
    user = db.query(User).filter(User.email == invite.email).first()

    # Validate the new status data and update the invite
    if status_update.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status.")
    invite.status = status_update.status

    # Create unregistered user if a registered account doesn't already exist
    if not user:
        user = User(email=invite.email, is_registered=False)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Set invite's user_id whether user existed previously or not
    invite.user_id = user.id
    db.commit()

    # Add user to event as a participant or host
    if status_update.status == "accepted" and user:
        # Only add if not already a participant/host
        existing = (
            db.query(Participant)
            .filter(
                Participant.event_id == invite.event_id,
                Participant.user_id == user.id,
                Participant.role == invite.role,
            )
            .first()
        )
        if not existing:
            event_participant = Participant(
                event_id=invite.event_id, user_id=user.id, role=invite.role
            )
            db.add(event_participant)
            db.commit()
        db.refresh(invite)
        return serialize_inviteout(invite, db)
    elif status_update.status == "accepted":
        db.refresh(invite)
        return serialize_inviteout(invite, db)
    else:
        db.refresh(invite)
        return serialize_inviteout(invite, db)


@router.delete("/{invite_id}", status_code=204)
def delete_invite(
    invite_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Delete an invite by its ID.

    Args:
        invite_id (int): ID of the invite to delete.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        None

    Raises:
        HTTPException: If invite not found or not authorized.
    """
    # Check that invite exists
    invite = db.query(Invite).filter(Invite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found.")

    # Fetch event from DB (for host check below)
    event = db.query(Event).filter(Event.id == invite.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    # Check that user is a host
    is_host = (
        db.query(Participant)
        .filter(
            Participant.event_id == event.id,
            Participant.user_id == user.id,
            Participant.role == "host",
        )
        .first()
    )
    if not is_host:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Delete the invite
    db.delete(invite)
    db.commit()
    return


@router.get("/", response_model=list[InviteOut])
def get_invites(
    status: str = Query(
        None, description="Status: pending, accepted, declined, all"
    ),
    # TODO: clean up (and comment) invite routes. Make them look like question routes. User id not needed becuase of auth?
    user_id: int = Query(None, description="Filter by user_id"),
    event_id: int = Query(None, description="Filter by event_id"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Fetch invites filtered by user_id, event_id, and status.
    If no user_id is provided, defaults to current user.

    Args:
        status (str): Status filter for invites.
        user_id (int): User ID to filter invites.
        event_id (int): Event ID to filter invites.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        List[InviteOut]: List of invites matching the filters.

    Raises:
        HTTPException: If event not found, not authorized, or invalid status.
    """
    invites = []

    # Fetch invites for an event
    if event_id is not None:
        # Check if event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found.")

        # Check if user is a host
        is_host = (
            db.query(Participant)
            .filter(
                Participant.event_id == event_id,
                Participant.user_id == user.id,
                Participant.role == "host",
            )
            .first()
        )
        if not is_host:
            raise HTTPException(status_code=403, detail="Not authorized.")

        # Fetch invites from DB
        invites = db.query(Invite).filter(Invite.event_id == event_id)

    # Fetch invites for current user
    else:
        invites = db.query(Invite).filter(Invite.user_id == user.id)

    # Filter invites by status
    if status and status != "all":
        if status not in ["pending", "accepted", "declined"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status parameter. Must be 'pending', 'accepted', 'declined', or 'all'.",
            )
        invites = invites.filter(Invite.status == status)

    # Return serialized invites
    return [serialize_inviteout(invite, db) for invite in invites]
