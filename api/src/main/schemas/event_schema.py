from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class EventBase(BaseModel):
    address: dict
    description: Optional[str] = None
    end_time: datetime
    start_time: datetime
    title: str


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int


class ParticipantOut(BaseModel):
    id: int
    name: str
    role: str
