# TODO: Delete?
from src.main.models import Invite, User


def serialize_questionout(question, db):
    # Fetch user info or invite info (i.e., email) if unregistered
    user = db.query(User).filter(User.id == question.user_id).first()
    if not user:
        user = (
            db.query(Invite).filter(Invite.user_id == question.user_id).first()
        )

    # Build name attribute
    if hasattr(user, "first_name") and hasattr(user, "last_name"):
        name = (
            f"{user.first_name or ''} {user.last_name or ''}".strip()
            or user.email
        )
    else:
        name = user.email

    return {
        "id": question.id,
        "event_id": question.event_id,
        "question_text": question.question_text,
        "answer_text": question.answer_text,
        "category_id": question.category_id,
        "is_published": question.is_published,
        "published_order": question.published_order,
        "draft_order": question.draft_order,
        "user_id": question.user_id,
        "user_name": name,
    }
