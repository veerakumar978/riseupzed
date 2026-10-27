"""Auth and session models for Riseupzed

Revision ID: 002_auth_and_sessions
Revises: 001_initial_schema
Create Date: 2026-10-27 14:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_auth_and_sessions'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. member_credentials
    op.create_table(
        'member_credentials',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_id', name='uq_member_credential_member_id')
    )
    op.create_index(op.f('ix_member_credentials_member_id'), 'member_credentials', ['member_id'], unique=True)

    # 2. user_sessions
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('session_token', sa.String(length=64), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='MEMBER'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_token', name='uq_user_sessions_session_token')
    )
    op.create_index(op.f('ix_user_sessions_session_token'), 'user_sessions', ['session_token'], unique=True)
    op.create_index(op.f('ix_user_sessions_member_id'), 'user_sessions', ['member_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_sessions_member_id'), table_name='user_sessions')
    op.drop_index(op.f('ix_user_sessions_session_token'), table_name='user_sessions')
    op.drop_table('user_sessions')
    op.drop_index(op.f('ix_member_credentials_member_id'), table_name='member_credentials')
    op.drop_table('member_credentials')
