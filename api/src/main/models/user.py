"""
SQLAlchemy ORM model for the User entity.

Defines the structure of the users table in the database, including columns
and constraints.
"""

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from src.main.database import Base


class User(Base):
    __tablename__ = "users"

    # Application Data
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_registered = Column(Boolean, default=False, nullable=False)

    # Relationships
    invites = relationship(
        "Invite", back_populates="user", cascade="all, delete-orphan"
    )
    asked_questions = relationship(
        "QuestionAsker", back_populates="user", cascade="all, delete-orphan"
    )
    questions = relationship(
        "Question", back_populates="user", cascade="all, delete-orphan"
    )
