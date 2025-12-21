"""revised questions so user_id is nullable

Revision ID: bc382d9a61bb
Revises: 46313dd07707
Create Date: 2025-12-20 18:40:10.102426

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'bc382d9a61bb'
down_revision: Union[str, None] = '46313dd07707'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### Create tables ###
    op.create_table('question_categories',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('question_categories_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('name', sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column('display_order', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], name='question_categories_event_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='question_categories_pkey'),
        postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_question_categories_id'), 'question_categories', ['id'], unique=False)
    op.create_table('questions',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('questions_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('event_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('category_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('question_text', sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column('answer_text', sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column('is_published', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=False),
        sa.Column('published_order', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('draft_order', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.Column('published_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['question_categories.id'], name='questions_category_id_fkey', ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], name='questions_event_id_fkey', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='questions_user_id_fkey', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='questions_pkey'),
        postgresql_ignore_search_path=False
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)
    op.create_table('question_askers',
        sa.Column('question_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], name=op.f('question_askers_question_id_fkey'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('question_askers_user_id_fkey'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('question_id', 'user_id', name=op.f('question_askers_pkey'))
    )


def downgrade() -> None:
    """Downgrade schema."""
    # ### Drop tables in reverse order ###
    op.drop_table('question_askers')
    op.drop_index(op.f('ix_questions_id'), table_name='questions')
    op.drop_table('questions')
    op.drop_index(op.f('ix_question_categories_id'), table_name='question_categories')
    op.drop_table('question_categories')
