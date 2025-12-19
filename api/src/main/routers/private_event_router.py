from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from src.main.database import get_db
from src.main.models import Event, Participant, User
from src.main.schemas import EventCreate, EventOut, ParticipantOut
from src.main.utils import (
    get_current_user_from_token,
    serialize_participantout,
)

router = APIRouter(tags=["PrivateEvents"], prefix="/api/private/events")


@router.post("/", response_model=EventOut)
def create_event(
    event_details: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Create a new event hosted by the current user.

    Args:
        event_details (EventCreate): Event details from request body.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        EventOut: The created event with host information.
    """
    # Create the new event from the user event details
    new_event = Event(
        address=event_details.address.model_dump(),
        description=event_details.description,
        end_time=event_details.end_time,
        start_time=event_details.start_time,
        title=event_details.title,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Add the host as an event participant
    participant = Participant(
        event_id=new_event.id, user_id=user.id, role="host"
    )
    db.add(participant)
    db.commit()

    # Use event_serialization utility to return an EventSummaryOut instance
    return EventOut.model_validate(
        new_event, from_attributes=True
    ).model_dump()


@router.get("/", response_model=List[EventOut])
def get_events(
    role: str = "participant",
    time: str = "all",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Fetch events for the current user based on the 'type' query parameter.

    Args:
        type (str):
            'host' - returns events the user is hosting.
            'participant' - returns events the user is participating in.

    Returns:
        List[EventOut]: List of events matching the query type.

    Raises:
        HTTPException: If an invalid type is provided.
    """
    # Save the current time
    now = datetime.now()

    # Role-based filtering
    if role == "host":
        event_ids = (
            db.query(Participant.event_id)
            .filter(Participant.user_id == user.id, Participant.role == "host")
            .subquery()
        )
        query = db.query(Event).filter(Event.id.in_(event_ids.select()))
    elif role == "participant":
        event_ids = (
            db.query(Participant.event_id)
            .filter(Participant.user_id == user.id)
            .subquery()
        )
        query = db.query(Event).filter(Event.id.in_(event_ids.select()))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role parameter. Must be 'host' or 'participant'.",
        )

    # Time-based filtering
    if time == "upcoming":
        query = query.filter(Event.start_time > now)
    elif time == "past":
        query = query.filter(Event.end_time < now)
    elif time != "all":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid time parameter. Must be 'upcoming', 'past', or 'all'.",
        )

    events = query.order_by(Event.start_time).all()
    return [
        EventOut.model_validate(event, from_attributes=True).model_dump()
        for event in events
    ]


@router.get("/{event_id}", response_model=EventOut)
def get_event_by_id(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Retrieve a specific event for the current user.

    Args:
        event_id (int): ID of the event to fetch.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        EventOut: The requested event if found and accessible.

    Raises:
        HTTPException: If the event is not found or not accessible.
    """
    # Fetch the event if the user is a host
    db_event = (
        db.query(Event)
        .join(Participant, Participant.event_id == Event.id)
        .filter(
            Event.id == event_id,
            Participant.user_id == user.id,
            Participant.role == "host",
        )
        .first()
    )
    if not db_event:
        # If not a host, fetch the event if the user is a participant
        db_event = (
            db.query(Event)
            .join(Participant, Participant.event_id == Event.id)
            .filter(Event.id == event_id, Participant.user_id == user.id)
            .first()
        )
        if not db_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
            )

    # Use event_serialization utility to return an EventFullOut instance
    return EventOut.model_validate(db_event, from_attributes=True).model_dump()


@router.get("/{event_id}/participants", response_model=list[ParticipantOut])
def get_participants_by_event_id(
    event_id: int,
    db: Session = Depends(get_db),
    role: str = Query(None, description="Role: 'host' or 'participant'"),
):
    """
    Retrieve the list of participants for a public event, optionally filtered by role.

    Args:
        event_id (int): ID of the event to fetch participants for.
        db (Session): Database session.
        role (str, optional): Role to filter by ('host' or 'participant').

    Returns:
        List[ParticipantOut]: List of participants for the event.

    Raises:
        HTTPException: If the event is not found.
    """
    # Fetch participants from DB based on filter criteria
    participants = db.query(Participant).filter(
        Participant.event_id == event_id
    )
    if role in {"host", "participant"}:
        participants = participants.filter(Participant.role == role)
    return [
        serialize_participantout(participant, db)
        for participant in participants
    ]


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    event_data: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Update an existing event hosted by the current user.

    Args:
        event_id (int): ID of the event to update.
        event_data (EventCreate): Updated event details.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        EventOut: The updated event.

    Raises:
        HTTPException: If the event is not found or not accessible.
    """
    # Fetch the event if the user is a host
    db_event = (
        db.query(Event)
        .join(Participant, Participant.event_id == Event.id)
        .filter(
            Event.id == event_id,
            Participant.user_id == user.id,
            Participant.role == "host",
        )
        .first()
    )
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Update the event details
    db_event.address = event_data.address.model_dump()
    db_event.description = event_data.description
    db_event.end_time = event_data.end_time
    db_event.start_time = event_data.start_time
    db_event.title = event_data.title
    db.commit()
    db.refresh(db_event)

    return EventOut.model_validate(db_event, from_attributes=True).model_dump()


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_from_token),
):
    """
    Delete an event hosted by the current user.

    Args:
        event_id (int): ID of the event to delete.
        db (Session): Database session.
        user (User): Current authenticated user.

    Returns:
        dict: Confirmation message upon successful deletion.

    Raises:
        HTTPException: If the event is not found or not accessible.
    """
    db_event = (
        db.query(Event)
        .join(Participant, Participant.event_id == Event.id)
        .filter(
            Event.id == event_id,
            Participant.user_id == user.id,
            Participant.role == "host",
        )
        .first()
    )
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    db.delete(db_event)
    db.commit()
    return {"detail": "Event deleted"}
