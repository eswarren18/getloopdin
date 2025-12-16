from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models import Event, Invite
from src.main.schemas import EventOut

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
