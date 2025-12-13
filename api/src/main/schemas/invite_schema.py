from typing import Optional

from pydantic import BaseModel, EmailStr

from .event_schema import EventOut


class InviteBase(BaseModel):
    email: EmailStr
    role: str = "participant"


class InviteCreate(InviteBase):
    event_id: int


class InviteOut(InviteBase):
    event: EventOut
    id: int
    status: str
    token: str
    user_name: Optional[str] = None


class InviteStatusUpdate(BaseModel):
    status: str = "pending"
