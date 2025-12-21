from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from src.main.database import get_db
from src.main.models import (
    Event,
    Invite,
    Participant,
    Question,
    QuestionAsker,
    QuestionCategory,
)
from src.main.schemas import (
    OrderUpdate,
    QuestionCreate,
    QuestionOut,
    QuestionUpdate,
)
from src.main.utils import get_current_user_from_token

router = APIRouter(prefix="/api", tags=["Questions"])


@router.get("/events/{event_id}/questions", response_model=list[QuestionOut])
def get_questions(
    event_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_from_token),
    invite_token: Optional[str] = None,
):
    # Fetch event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    is_host = False
    authorized = False

    # Validate authentication (path 1: registered user)
    if user:
        participant = (
            db.query(Participant)
            .filter(
                Participant.event_id == event_id,
                Participant.user_id == user.id,
            )
            .first()
        )
        if participant:
            authorized = True
            if participant.role == "host":
                is_host = True

    # Validate authentication (path 2: invite token)
    elif invite_token:
        invite = db.query(Invite).filter(Invite.token == invite_token).first()
        if invite and invite.event_id == event_id:
            authorized = True

    if not authorized:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    # Query questions
    query = db.query(Question).filter(Question.event_id == event_id)
    if not is_host:
        query = query.filter(Question.is_published == True)

    questions = query.order_by(
        desc(Question.is_published),
        asc(Question.published_order),
        asc(Question.draft_order),
    ).all()

    return questions


@router.post("/events/{event_id}/questions", response_model=QuestionOut)
def create_question(
    event_id: int,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_from_token),
):
    event = None
    asker_user_id = None

    # Validate authentication (path 1: registered user)
    if user:
        asker_user_id = user.id
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Host validation to publish
        if payload.is_published:
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
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only hosts can publish questions",
                )

    # Validate authentication (path 2: invite token)
    else:
        if not payload.invite_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
            )

        invite = (
            db.query(Invite)
            .filter(Invite.token == payload.invite_token)
            .first()
        )
        if not invite:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid or expired invite token",
            )

        # Enforce: invite must match event
        if event_id != invite.event_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invite token does not match event",
            )

        event = db.query(Event).filter(Event.id == invite.event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Anonymous users cannot publish
        if payload.is_published:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anonymous users cannot publish questions",
            )

    # Validate published questions must have answer
    if payload.is_published and not payload.answer_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Published questions must include an answer",
        )

    # Validate category
    if payload.category_id is not None:
        category = (
            db.query(QuestionCategory)
            .filter(
                QuestionCategory.id == payload.category_id,
                QuestionCategory.event_id == event.id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category for this event",
            )

    # Handle ordering
    draft_order = None
    published_order = None

    if payload.is_published:
        max_published = (
            db.query(Question.published_order)
            .filter(
                Question.event_id == event.id,
                Question.is_published == True,
            )
            .order_by(Question.published_order.desc())
            .first()
        )
        published_order = (
            (max_published[0] + 1) if max_published and max_published[0] else 1
        )
    else:
        max_draft = (
            db.query(Question.draft_order)
            .filter(
                Question.event_id == event.id,
                Question.is_published == False,
            )
            .order_by(Question.draft_order.desc())
            .first()
        )
        draft_order = (max_draft[0] + 1) if max_draft and max_draft[0] else 1

    # Create question
    question = Question(
        question_text=payload.question_text,
        answer_text=payload.answer_text,
        event_id=event_id,
        user_id=asker_user_id,
        category_id=payload.category_id,
        is_published=payload.is_published,
        published_order=published_order,
        draft_order=draft_order,
    )

    db.add(question)
    db.flush()

    # Record asker (registered users only)
    if asker_user_id:
        db.add(
            QuestionAsker(
                question_id=question.id,
                user_id=asker_user_id,
            )
        )

    db.commit()
    db.refresh(question)
    return question


@router.put("/events/{event_id}/questions/order", status_code=204)
def update_order(
    event_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_from_token),
):
    # Validate auth
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate host
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
        raise HTTPException(
            status_code=403, detail="Only hosts can reorder questions"
        )

    # Fetch question
    now = func.now()
    for item in payload.items:
        question = (
            db.query(Question)
            .filter(
                Question.id == item.question_id,
                Question.event_id == event_id,
            )
            .first()
        )
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # Publishing requires answer
        if item.is_published and not question.answer_text:
            raise HTTPException(
                status_code=400,
                detail="Published questions must include an answer",
            )

        question.is_published = item.is_published
        question.category_id = item.category_id
        question.published_order = item.published_order
        question.draft_order = item.draft_order
        question.updated_at = now

        if item.is_published:
            question.published_at = question.published_at or now
        else:
            question.published_at = None

    db.commit()


@router.put(
    "/events/{event_id}/questions/{question_id}", response_model=QuestionOut
)
def update_question(
    event_id: int,
    question_id: int,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_from_token),
):
    # Validate auth
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate host
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
        raise HTTPException(
            status_code=403, detail="Only hosts can update questions"
        )

    # Fetch question
    question = (
        db.query(Question)
        .filter(
            Question.id == question_id,
            Question.event_id == event_id,
        )
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Update question
    if payload.question_text is not None:
        question.question_text = payload.question_text

    if payload.answer_text is not None:
        question.answer_text = payload.answer_text

    question.updated_at = func.now()

    db.commit()
    db.refresh(question)
    return question


@router.delete("/events/{event_id}/questions/{question_id}", status_code=204)
def delete_question(
    event_id: int,
    question_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_from_token),
):
    # Validate authentication (registered user)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate authorization (host)
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
        raise HTTPException(
            status_code=403, detail="Only hosts can delete questions"
        )

    # Fetch question
    question = (
        db.query(Question)
        .filter(
            Question.id == question_id,
            Question.event_id == event_id,
        )
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(question)
    db.commit()
