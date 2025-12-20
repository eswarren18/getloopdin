"""
SQLAlchemy ORM models for Event and Participant entities.

Defines the structure of the events and participants, and invites tables in
the database, including columns and constraints.
"""

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship
from src.main.database import Base


class Event(Base):
    __tablename__ = "events"

    # Application Data
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
    question_categories = relationship(
        "QuestionCategory",
        back_populates="event",
        cascade="all, delete-orphan",
    )
    questions = relationship(
        "Question", back_populates="event", cascade="all, delete-orphan"
    )


# many-to-many relationship between Event and User
class Participant(Base):
    __tablename__ = "participants"

    # Application Data
    role = Column(String, nullable=False)
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    # Relationships
    event = relationship("Event", back_populates="participants")
    user = relationship(
        "User",
        backref=backref("event_participations", cascade="all, delete-orphan"),
    )
