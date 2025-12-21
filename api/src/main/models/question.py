"""
SQLAlchemy ORM models for Question and QuestionAsker entities.

Defines the structure of the questions and question_askers tables in the database, including columns, metadata, and relationships.

Question: Stores questions associated with events and users, including text, status, and ordering fields.
QuestionAsker: Associates users with questions they have asked, supporting many-to-many relationships between users and questions.
"""

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.main.database import Base


class Question(Base):
    __tablename__ = "questions"

    # Application Data
    answer_text = Column(Text, nullable=True)
    draft_order = Column(Integer, nullable=True)
    category_id = Column(
        Integer,
        ForeignKey("question_categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    id = Column(Integer, primary_key=True, index=True)
    is_published = Column(Boolean, nullable=False, default=False)
    published_order = Column(Integer, nullable=True)
    question_text = Column(Text, nullable=False)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )

    # Metadata
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=func.now()
    )
    published_at = Column(TIMESTAMP(timezone=True))
    updated_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=func.now()
    )

    # Relationships
    askers = relationship(
        "QuestionAsker",
        back_populates="question",
        cascade="all, delete-orphan",
    )
    category = relationship("QuestionCategory", back_populates="questions")
    event = relationship("Event", back_populates="questions")
    user = relationship("User", back_populates="questions")


class QuestionAsker(Base):
    __tablename__ = "question_askers"

    # Application Data
    question_id = Column(
        Integer,
        ForeignKey("questions.id", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    # Metadata
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=func.now()
    )

    # Relationships
    question = relationship("Question", back_populates="askers")
    user = relationship("User", back_populates="asked_questions")


class QuestionCategory(Base):
    __tablename__ = "question_categories"

    # Application Data
    display_order = Column(Integer, nullable=False)
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)

    # Metadata
    created_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=func.now()
    )
    updated_at = Column(
        TIMESTAMP(timezone=True), nullable=False, default=func.now()
    )

    # Relationships
    event = relationship("Event", back_populates="question_categories")
    questions = relationship("Question", back_populates="category")
