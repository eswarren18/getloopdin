from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class QuestionCreate(BaseModel):
    question_text: str

    # Host-only options
    answer_text: Optional[str] = None
    category_id: Optional[int] = None
    is_published: bool = False

    # Anonymous path
    invite_token: Optional[str] = None


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    answer_text: Optional[str] = None


class OrderUpdateItem(BaseModel):
    question_id: int
    is_published: bool
    category_id: Optional[int] = None
    published_order: Optional[int] = None
    draft_order: Optional[int] = None


class OrderUpdate(BaseModel):
    items: list[OrderUpdateItem]


class QuestionOut(BaseModel):
    id: int
    event_id: int
    question_text: str
    answer_text: Optional[str] = None
    category_id: Optional[int] = None

    is_published: bool
    published_order: Optional[int] = None
    draft_order: Optional[int] = None

    user_id: Optional[int] = None

    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        orm_mode = True
