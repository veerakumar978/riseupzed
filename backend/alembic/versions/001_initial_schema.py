"""Initial schema for Riseupzed backend foundation

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-27 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Packages
    op.create_table(
        'packages',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('code', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(length=64), nullable=False),
        sa.Column('display_name', sa.String(length=128), nullable=False),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_packages_code', 'packages', ['code'], unique=True)

    # 2. Members
    op.create_table(
        'members',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('member_code', sa.String(length=32), nullable=False),
        sa.Column('display_name', sa.String(length=128), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=32), nullable=True),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='MEMBER'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='ACTIVE'),
        sa.Column('package_id', sa.String(length=36), nullable=True),
        sa.Column('activation_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['package_id'], ['packages.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_members_member_code', 'members', ['member_code'], unique=True)
    op.create_index('ix_members_email', 'members', ['email'], unique=True)

    # 3. Organization Relationships
    op.create_table(
        'organization_relationships',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('parent_id', sa.String(length=36), nullable=False),
        sa.Column('child_id', sa.String(length=36), nullable=False),
        sa.Column('position', sa.String(length=16), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['child_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('child_id'),
        sa.UniqueConstraint('parent_id', 'position', name='uq_parent_position'),
        sa.CheckConstraint("parent_id != child_id", name="chk_not_self_parent"),
        sa.CheckConstraint("position IN ('LEFT', 'RIGHT')", name="chk_valid_position"),
    )
    op.create_index('ix_org_parent_id', 'organization_relationships', ['parent_id'])

    # 4. Wallets
    op.create_table(
        'wallets',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('wallet_type', sa.String(length=32), nullable=False),
        sa.Column('balance', sa.Numeric(precision=18, scale=4), nullable=False, server_default='0.0000'),
        sa.Column('currency', sa.String(length=16), nullable=False, server_default='USDT'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('member_id', 'wallet_type', name='uq_member_wallet_type'),
    )
    op.create_index('ix_wallets_member_id', 'wallets', ['member_id'])

    # 5. Transactions
    op.create_table(
        'transactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reference', sa.String(length=64), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('wallet_id', sa.String(length=36), nullable=True),
        sa.Column('tx_type', sa.String(length=32), nullable=False),
        sa.Column('direction', sa.String(length=16), nullable=False),
        sa.Column('amount', sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='COMPLETED'),
        sa.Column('remark', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_transactions_reference', 'transactions', ['reference'], unique=True)
    op.create_index('ix_transactions_member_id', 'transactions', ['member_id'])
    op.create_index('ix_transactions_tx_type', 'transactions', ['tx_type'])

    # 6. Deposit Requests
    op.create_table(
        'deposit_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reference', sa.String(length=64), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column('currency', sa.String(length=16), nullable=False, server_default='USDT'),
        sa.Column('proof_url', sa.String(length=512), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('review_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_deposit_requests_reference', 'deposit_requests', ['reference'], unique=True)
    op.create_index('ix_deposit_requests_member_id', 'deposit_requests', ['member_id'])
    op.create_index('ix_deposit_requests_status', 'deposit_requests', ['status'])

    # 7. Withdrawal Requests
    op.create_table(
        'withdrawal_requests',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reference', sa.String(length=64), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('wallet_id', sa.String(length=36), nullable=False),
        sa.Column('amount', sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column('destination_address', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='PENDING'),
        sa.Column('review_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_withdrawal_requests_reference', 'withdrawal_requests', ['reference'], unique=True)
    op.create_index('ix_withdrawal_requests_member_id', 'withdrawal_requests', ['member_id'])
    op.create_index('ix_withdrawal_requests_status', 'withdrawal_requests', ['status'])

    # 8. Token Transfers
    op.create_table(
        'token_transfers',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('reference', sa.String(length=64), nullable=False),
        sa.Column('sender_id', sa.String(length=36), nullable=False),
        sa.Column('receiver_id', sa.String(length=36), nullable=False),
        sa.Column('transfer_type', sa.String(length=32), nullable=False, server_default='PEER_TO_PEER'),
        sa.Column('amount', sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='COMPLETED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['receiver_id'], ['members.id'], ),
        sa.ForeignKeyConstraint(['sender_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_token_transfers_reference', 'token_transfers', ['reference'], unique=True)

    # 9. Support Tickets
    op.create_table(
        'support_tickets',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('ticket_number', sa.String(length=32), nullable=False),
        sa.Column('member_id', sa.String(length=36), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(length=16), nullable=False, server_default='MEDIUM'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='OPEN'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_support_tickets_ticket_number', 'support_tickets', ['ticket_number'], unique=True)


def downgrade() -> None:
    op.drop_table('support_tickets')
    op.drop_table('token_transfers')
    op.drop_table('withdrawal_requests')
    op.drop_table('deposit_requests')
    op.drop_table('transactions')
    op.drop_table('wallets')
    op.drop_table('organization_relationships')
    op.drop_table('members')
    op.drop_table('packages')
