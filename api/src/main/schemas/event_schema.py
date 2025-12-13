from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ParticipantOut(BaseModel):
    participant_name: str
    role: str


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    hosts: List[str]
