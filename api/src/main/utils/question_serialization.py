# TODO: Delete?
from src.main.models import Question


def serialize_questionout(question: Question) -> dict:
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
        "asker_user_ids": [asker.user_id for asker in question.askers],
    }
