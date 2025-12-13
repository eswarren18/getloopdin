from src.main.models import User


def serialize_participantout(participant, db):
    # Build name attribute
    user = db.query(User).filter(User.id == participant.user_id).first()
    if user:
        name = (
            f"{user.first_name or ''} {user.last_name or ''}".strip()
            or user.email
        )

    return {
        "id": participant.user_id,
        "name": name,
        "role": participant.role,
    }
