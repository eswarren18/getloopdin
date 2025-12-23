from datetime import datetime
from typing import Optional

from pydantic import BaseModel


# --- Questions ---
class QuestionCreate(BaseModel):
    question_text: str

    # Host-only options
    answer_text: Optional[str] = None
    category_id: Optional[int] = None
    is_published: bool = False

    # Anonymous path
    invite_token: Optional[str] = None


class QuestionUpdate(BaseModel):
    asker_user_ids: Optional[list[int]] = None
    answer_text: Optional[str] = None
    question_text: Optional[str] = None


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

    class Config:
        orm_mode = True


# --- Categories ---
class QuestionCategoryCreate(BaseModel):
    name: str


class QuestionCategoryUpdate(BaseModel):
    name: Optional[str] = None


class QuestionCategoryOrderItem(BaseModel):
    category_id: int
    display_order: int


class QuestionCategoryOrderUpdate(BaseModel):
    items: list[QuestionCategoryOrderItem]


class QuestionCategoryOut(BaseModel):
    id: int
    event_id: int
    name: str
    display_order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
