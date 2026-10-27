"""Packages and rank upgrades for Module 8

Revision ID: 004_packages_and_upgrades
Revises: 003_profile_and_financial
Create Date: 2026-10-27 17:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_packages_and_upgrades'
down_revision: Union[str, None] = '003_profile_and_financial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add columns to packages
    op.add_column('packages', sa.Column('upgrade_amount', sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column('packages', sa.Column('achievement_threshold', sa.Numeric(precision=14, scale=2), nullable=True))
    op.add_column('packages', sa.Column('description', sa.String(length=255), nullable=True))

    # 2. Create upgrade_requests table
    op.create_table(
        'upgrade_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reference', sa.String(length=64), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('current_package_id', sa.String(length=36), nullable=True),
        sa.Column('target_package_id', sa.String(length=36), nullable=False),
        sa.Column('upgrade_amount', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('review_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['current_package_id'], ['packages.id'], ),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_package_id'], ['packages.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_upgrade_requests_member_id'), 'upgrade_requests', ['member_id'], unique=False)
    op.create_index(op.f('ix_upgrade_requests_reference'), 'upgrade_requests', ['reference'], unique=True)
    op.create_index(op.f('ix_upgrade_requests_status'), 'upgrade_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_upgrade_requests_status'), table_name='upgrade_requests')
    op.drop_index(op.f('ix_upgrade_requests_reference'), table_name='upgrade_requests')
    op.drop_index(op.f('ix_upgrade_requests_member_id'), table_name='upgrade_requests')
    op.drop_table('upgrade_requests')
    op.drop_column('packages', 'description')
    op.drop_column('packages', 'achievement_threshold')
    op.drop_column('packages', 'upgrade_amount')
