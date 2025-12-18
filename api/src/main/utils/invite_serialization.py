from src.main.models import Event, User


def serialize_inviteout(invite, db):
    # Fetch and serialize associated event
    event = db.query(Event).filter(Event.id == invite.event_id).first()
    serialized_event = None
    if event:
        serialized_event = {
            "address": event.address,
            "description": event.description,
            "end_time": event.end_time,
            "id": event.id,
            "start_time": event.start_time,
            "title": event.title,
        }

    # Build user_name attribute
    user = db.query(User).filter(User.id == invite.user_id).first()
    if user:
        user_name = (
            f"{user.first_name or ''} {user.last_name or ''}".strip()
            or user.email
        )
    else:
        user_name = invite.email

    return {
        "email": invite.email,
        "event": serialized_event,
        "id": invite.id,
        "role": invite.role,
        "status": invite.status,
        "token": invite.token,
        "user_name": user_name,
    }
