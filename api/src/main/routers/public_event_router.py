from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models import Event, Invite
from src.main.schemas import EventOut, ParticipantOut
from src.main.utils import serialize_participantout

router = APIRouter(tags=["PublicEvents"], prefix="/api/public/events")


@router.get("/token/{token}", response_model=EventOut)
def get_event_by_token(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve event details using an invite token.

    Args:
        token (str): Invite token from the URL.
        db (Session): Database session.

    Returns:
        EventOut: The event associated with the invite token.

    Raises:
        HTTPException: If the invite or event is not found or invalid.
    """
    # Fetch invite from DB
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite:
        raise HTTPException(
            status_code=404, detail="Invalid or expired invite token."
        )

    # Fetch event associated with invite
    event = db.query(Event).filter(Event.id == invite.event_id).first()
    if not event:
        raise HTTPException(
            status_code=404, detail="Event not found for this invite."
        )

    # Return event after converting from a DB object to an EventOut
    return EventOut.model_validate(event, from_attributes=True).model_dump()


# TODO: Update with query strings (accepted, pending, declined, host, participant)
@router.get("/{event_id}/participants", response_model=list[ParticipantOut])
def get_participants(event_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the list of accepted participants for a public event.

    Args:
        event_id (int): ID of the event to fetch participants for.
        db (Session): Database session.

    Returns:
        List[InviteOut]: List of accepted invites (participants) for the event.

    Raises:
        HTTPException: If the event is not found.
    """
    # Fetch invites associated with the event
    invites = (
        db.query(Invite)
        .filter(Invite.event_id == event_id, Invite.status == "accepted")
        .all()
    )
    return [serialize_participantout(invite, db) for invite in invites]
