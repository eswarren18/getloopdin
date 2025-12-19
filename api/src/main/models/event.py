"""
SQLAlchemy ORM models for Event and Participant entities.

Defines the structure of the events and participants, and invites tables in
the database, including columns and constraints.
"""

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import backref, relationship
from src.main.database import Base


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(TIMESTAMP(timezone=True), nullable=False)
    end_time = Column(TIMESTAMP(timezone=True), nullable=False)
    address = Column(String, nullable=False)
    participants = relationship(
        "Participant", back_populates="event", cascade="all, delete-orphan"
    )
    invites = relationship(
        "Invite", back_populates="event", cascade="all, delete-orphan"
    )


# many-to-many relationship between Event and User
class Participant(Base):
    __tablename__ = "participants"
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role = Column(String, nullable=False)
    event = relationship("Event", back_populates="participants")
    user = relationship(
        "User",
        backref=backref("event_participations", cascade="all, delete-orphan"),
    )
