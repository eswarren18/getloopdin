from src.main.models import User


def serialize_participantout(invite, db):
    # Build name attribute
    user = db.query(User).filter(User.id == invite.user_id).first()
    if user:
        name = (
            f"{user.first_name or ''} {user.last_name or ''}".strip()
            or user.email
        )
    else:
        name = invite.email

    return {
        "id": invite.user_id,
        "name": name,
        "role": invite.role,
    }
