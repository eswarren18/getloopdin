from src.main.models import User


def serialize_eventout(event):
    # Get all hosts (participants with role='host')
    hosts = []
    for participant in event.participants:
        if participant.role == "host":
            user = participant.user
            if user:
                name = (
                    f"{user.first_name or ''} {user.last_name or ''}".strip()
                    or user.email
                )
            else:
                name = None
            hosts.append(name)
    return {
        "id": event.id,
        "title": event.title,
        "description": event.description or None,
        "hosts": hosts,
        "start_time": event.start_time,
        "end_time": event.end_time,
    }


def serialize_participantout(invite):
    user = invite.user
    if user:
        name = (
            f"{user.first_name or ''} {user.last_name or ''}".strip()
            or user.email
        )
    else:
        name = invite.email
    return {
        "participant_name": name,
        "role": invite.role,
    }
