from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Address(BaseModel):
    formatted_address: str
    lat: float
    lon: float
    place_id: int


class EventBase(BaseModel):
    address: Address
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
