"""Profile and financial models for Module 6 and 7

Revision ID: 003_profile_and_financial
Revises: 002_auth_and_sessions
Create Date: 2026-10-27 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003_profile_and_financial'
down_revision: Union[str, None] = '002_auth_and_sessions'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. nominees
    op.create_table(
        'nominees',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('full_name', sa.String(length=128), nullable=False),
        sa.Column('relationship', sa.String(length=64), nullable=False),
        sa.Column('contact_number', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_id', name='uq_nominees_member_id')
    )
    op.create_index(op.f('ix_nominees_member_id'), 'nominees', ['member_id'], unique=True)

    # 2. member_wallet_addresses
    op.create_table(
        'member_wallet_addresses',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('network', sa.String(length=32), nullable=False, server_default='USDT_BEP20'),
        sa.Column('wallet_address', sa.String(length=128), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_id', name='uq_member_wallet_addresses_member_id')
    )
    op.create_index(op.f('ix_member_wallet_addresses_member_id'), 'member_wallet_addresses', ['member_id'], unique=True)

    # 3. Add transaction_pin_hash to member_credentials
    op.add_column('member_credentials', sa.Column('transaction_pin_hash', sa.String(length=255), nullable=True))

    # 4. Add tx_reference and note to deposit_requests
    op.add_column('deposit_requests', sa.Column('tx_reference', sa.String(length=128), nullable=True))
    op.add_column('deposit_requests', sa.Column('note', sa.Text(), nullable=True))

    # 5. Add package_id to withdrawal_requests
    op.add_column('withdrawal_requests', sa.Column('package_id', sa.String(length=36), nullable=True))
    op.create_foreign_key(
        'fk_withdrawal_requests_package_id',
        'withdrawal_requests', 'packages',
        ['package_id'], ['id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_withdrawal_requests_package_id', 'withdrawal_requests', type_='foreignkey')
    op.drop_column('withdrawal_requests', 'package_id')
    op.drop_column('deposit_requests', 'note')
    op.drop_column('deposit_requests', 'tx_reference')
    op.drop_column('member_credentials', 'transaction_pin_hash')
    op.drop_index(op.f('ix_member_wallet_addresses_member_id'), table_name='member_wallet_addresses')
    op.drop_table('member_wallet_addresses')
    op.drop_index(op.f('ix_nominees_member_id'), table_name='nominees')
    op.drop_table('nominees')
