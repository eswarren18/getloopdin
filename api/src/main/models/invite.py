"""
SQLAlchemy ORM model for Invite entities.

Defines the structure of the invites table in the database, including columns
and constraints.
"""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from src.main.database import Base


class Invite(Base):
    __tablename__ = "invites"

    # Application Data
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    status = Column(String, nullable=False, default="pending")

    # Relationships
    event = relationship("Event", back_populates="invites")
    user = relationship("User", back_populates="invites")
