import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.db.session import SessionLocal
from app.db.models.package import Package
from app.db.models.member import Member
from app.db.models.organization import OrganizationRelationship
from app.db.models.wallet import Wallet
from app.db.models.transaction import Transaction
from app.db.models.deposit import DepositRequest
from app.db.models.withdrawal import WithdrawalRequest
from app.db.models.transfer import TokenTransfer
from app.db.models.support import SupportTicket
from app.db.models.auth import MemberCredential, UserSession
from app.db.models.profile import Nominee, MemberWalletAddress
from app.db.models.upgrade import UpgradeRequest
from app.core.security import hash_password
from app.core.logging import logger


def seed_database():
    """Deterministic seed script for Riseupzed demonstration environment."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # 1. Packages with rank upgrade & achievement threshold data
        packages_data = [
            {
                "code": "STARTER",
                "name": "Starter Staker",
                "display_name": "Starter Package (100 USDT)",
                "price": Decimal("100.00"),
                "upgrade_amount": Decimal("5000.00"),
                "achievement_threshold": Decimal("10000.00"),
                "description": "Entry-tier staking and network node qualification.",
                "sort_order": 1,
            },
            {
                "code": "SILVER",
                "name": "Silver Staker",
                "display_name": "Silver Package (500 USDT)",
                "price": Decimal("500.00"),
                "upgrade_amount": Decimal("15000.00"),
                "achievement_threshold": Decimal("30000.00"),
                "description": "Accelerated network yield tier with silver status.",
                "sort_order": 2,
            },
            {
                "code": "GOLD",
                "name": "Gold Executive",
                "display_name": "Gold Package (1,000 USDT)",
                "price": Decimal("1000.00"),
                "upgrade_amount": Decimal("45000.00"),
                "achievement_threshold": Decimal("90000.00"),
                "description": "Executive staking node with enhanced binary volume weighting.",
                "sort_order": 3,
            },
            {
                "code": "PLATINUM",
                "name": "Platinum Director",
                "display_name": "Platinum Package (2,500 USDT)",
                "price": Decimal("2500.00"),
                "upgrade_amount": Decimal("100000.00"),
                "achievement_threshold": Decimal("200000.00"),
                "description": "Director-grade vault yield with prioritized liquidity routing.",
                "sort_order": 4,
            },
            {
                "code": "DIAMOND",
                "name": "Diamond Ambassador",
                "display_name": "Blue Diamond VIP Package (5,000 USDT)",
                "price": Decimal("5000.00"),
                "upgrade_amount": Decimal("250000.00"),
                "achievement_threshold": Decimal("500000.00"),
                "description": "Premier Blue Diamond ambassador tier with top staking rewards.",
                "sort_order": 5,
            },
        ]

        package_map = {}
        for p in packages_data:
            existing = db.scalar(select(Package).where(Package.code == p["code"]))
            if not existing:
                pkg = Package(
                    code=p["code"],
                    name=p["name"],
                    display_name=p["display_name"],
                    price=p["price"],
                    upgrade_amount=p["upgrade_amount"],
                    achievement_threshold=p["achievement_threshold"],
                    description=p["description"],
                    sort_order=p["sort_order"],
                    is_active=True,
                )
                db.add(pkg)
                db.flush()
                package_map[p["code"]] = pkg
            else:
                existing.upgrade_amount = p["upgrade_amount"]
                existing.achievement_threshold = p["achievement_threshold"]
                existing.description = p["description"]
                existing.display_name = p["display_name"]
                package_map[p["code"]] = existing

        logger.info(f"Verified {len(package_map)} packages.")

        # 2. Members
        members_data = [
            {
                "member_code": "RZ-1001",
                "display_name": "Alex Vance (Manager)",
                "email": "alex.vance@riseupdemo.io",
                "phone": "+1-555-0192",
                "role": "MANAGER",
                "status": "ACTIVE",
                "package_code": "DIAMOND",
                "activation_date": now - timedelta(days=90),
            },
            {
                "member_code": "RZ-8942",
                "display_name": "Johnathan Sterling",
                "email": "j.sterling@apexcapital.io",
                "phone": "+1-555-0144",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "DIAMOND",
                "activation_date": now - timedelta(days=60),
            },
            {
                "member_code": "RZ-8943",
                "display_name": "Elena Rostova",
                "email": "e.rostova@riseupdemo.io",
                "phone": "+1-555-0187",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "PLATINUM",
                "activation_date": now - timedelta(days=45),
            },
            {
                "member_code": "RZ-8944",
                "display_name": "Marcus Chen",
                "email": "m.chen@riseupdemo.io",
                "phone": "+1-555-0131",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "GOLD",
                "activation_date": now - timedelta(days=30),
            },
            {
                "member_code": "RZ-8945",
                "display_name": "Sarah Al-Mansoor",
                "email": "s.mansoor@riseupdemo.io",
                "phone": "+1-555-0199",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "SILVER",
                "activation_date": now - timedelta(days=15),
            },
            {
                "member_code": "RZ-8946",
                "display_name": "David Thorne",
                "email": "d.thorne@riseupdemo.io",
                "phone": "+1-555-0210",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "GOLD",
                "activation_date": now - timedelta(days=20),
            },
            {
                "member_code": "RZ-8947",
                "display_name": "Amina Bello",
                "email": "a.bello@riseupdemo.io",
                "phone": "+1-555-0215",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "SILVER",
                "activation_date": now - timedelta(days=10),
            },
            {
                "member_code": "RZ-8948",
                "display_name": "Tariq Malik",
                "email": "t.malik@riseupdemo.io",
                "phone": "+1-555-0220",
                "role": "MEMBER",
                "status": "ACTIVE",
                "package_code": "STARTER",
                "activation_date": now - timedelta(days=2),
            },
        ]

        member_map = {}
        for m in members_data:
            existing = db.scalar(select(Member).where(Member.member_code == m["member_code"]))
            if not existing:
                member = Member(
                    member_code=m["member_code"],
                    display_name=m["display_name"],
                    email=m["email"],
                    phone=m["phone"],
                    role=m["role"],
                    status=m["status"],
                    package_id=package_map[m["package_code"]].id,
                    activation_date=m["activation_date"],
                )
                db.add(member)
                db.flush()
                member_map[m["member_code"]] = member
            else:
                member_map[m["member_code"]] = existing

        logger.info(f"Verified {len(member_map)} demo members.")

        # 2b. Credentials for demo accounts
        # Default passwords:
        # RZ-1001 (Manager) -> manager123
        # RZ-8942 (Member)  -> member123
        # Others            -> demo123
        demo_passwords = {
            "RZ-1001": "manager123",
            "RZ-8942": "member123",
            "RZ-8943": "demo123",
            "RZ-8944": "demo123",
            "RZ-8945": "demo123",
            "RZ-8946": "demo123",
            "RZ-8947": "demo123",
            "RZ-8948": "demo123",
        }
        for code, pwd in demo_passwords.items():
            mem = member_map.get(code)
            if mem:
                existing_cred = db.scalar(
                    select(MemberCredential).where(MemberCredential.member_id == mem.id)
                )
                if not existing_cred:
                    db.add(
                        MemberCredential(
                            member_id=mem.id,
                            password_hash=hash_password(pwd),
                            is_active=True,
                        )
                    )
        db.flush()
        logger.info("Verified demo credentials for authentication.")

        # 3. Binary Organization Relationships
        # Tree hierarchy:
        # RZ-8942 (Johnathan)
        #   ├── LEFT: RZ-8943 (Elena)
        #   │     ├── LEFT: RZ-8945 (Sarah)
        #   │     └── RIGHT: vacant
        #   └── RIGHT: RZ-8944 (Marcus)
        #         ├── LEFT: RZ-8946 (David)
        #         └── RIGHT: RZ-8947 (Amina)
        # Unplaced: RZ-8948 (Tariq)
        placements = [
            ("RZ-8942", "RZ-8943", "LEFT"),
            ("RZ-8942", "RZ-8944", "RIGHT"),
            ("RZ-8943", "RZ-8945", "LEFT"),
            ("RZ-8944", "RZ-8946", "LEFT"),
            ("RZ-8944", "RZ-8947", "RIGHT"),
        ]
        for parent_code, child_code, pos in placements:
            p_mem = member_map.get(parent_code)
            c_mem = member_map.get(child_code)
            if p_mem and c_mem:
                existing_rel = db.scalar(
                    select(OrganizationRelationship).where(
                        OrganizationRelationship.parent_id == p_mem.id,
                        OrganizationRelationship.position == pos,
                    )
                )
                if not existing_rel:
                    db.add(
                        OrganizationRelationship(
                            parent_id=p_mem.id,
                            child_id=c_mem.id,
                            position=pos,
                        )
                    )
        db.flush()

        primary_member = member_map.get("RZ-8942")


        # 4. Wallets for Johnathan Sterling
        if primary_member:
            wallets_seed = [
                {"type": "TRANSACTION", "balance": Decimal("148920.4500")},
                {"type": "MOTHER", "balance": Decimal("25000.0000")},
                {"type": "STAKING", "balance": Decimal("95000.0000")},
            ]
            for w in wallets_seed:
                existing_w = db.scalar(
                    select(Wallet).where(
                        Wallet.member_id == primary_member.id,
                        Wallet.wallet_type == w["type"],
                    )
                )
                if not existing_w:
                    db.add(
                        Wallet(
                            member_id=primary_member.id,
                            wallet_type=w["type"],
                            balance=w["balance"],
                            currency="USDT",
                        )
                    )
            db.flush()

        # 5. Transactions for Johnathan
        tx_wallet = db.scalar(
            select(Wallet).where(
                Wallet.member_id == primary_member.id,
                Wallet.wallet_type == "TRANSACTION",
            )
        )
        sample_txs = [
            # Deposit
            {"ref": "TX-8921-948", "type": "DEPOSIT", "dir": "CREDIT", "amt": Decimal("2450.0000"), "rem": "Direct vault funding approval", "dt": datetime(2026, 10, 26, 10, 45, tzinfo=timezone.utc)},
            # Multiple Matching Incentives
            {"ref": "MI-2026-1025", "type": "MATCHING_INCENTIVE", "dir": "CREDIT", "amt": Decimal("1120.0000"), "rem": "Binary matching bonus cycle 44", "dt": datetime(2026, 10, 25, 9, 30, tzinfo=timezone.utc)},
            {"ref": "MI-2026-1018", "type": "MATCHING_INCENTIVE", "dir": "CREDIT", "amt": Decimal("980.0000"), "rem": "Binary matching bonus cycle 43", "dt": datetime(2026, 10, 18, 9, 30, tzinfo=timezone.utc)},
            {"ref": "MI-2026-1011", "type": "MATCHING_INCENTIVE", "dir": "CREDIT", "amt": Decimal("850.0000"), "rem": "Binary matching bonus cycle 42", "dt": datetime(2026, 10, 11, 9, 30, tzinfo=timezone.utc)},
            # Re-Buy Matching Incentives
            {"ref": "RB-2026-1022", "type": "REBUY_INCENTIVE", "dir": "CREDIT", "amt": Decimal("320.0000"), "rem": "Re-buy matching incentive tier yield node RZ-8943", "dt": datetime(2026, 10, 22, 14, 15, tzinfo=timezone.utc)},
            {"ref": "RB-2026-1015", "type": "REBUY_INCENTIVE", "dir": "CREDIT", "amt": Decimal("280.0000"), "rem": "Re-buy matching incentive tier yield node RZ-8944", "dt": datetime(2026, 10, 15, 14, 15, tzinfo=timezone.utc)},
            # Weekly Cashback (4 records dated 3, 10, 17, 24 October 2026, total 600.00 tokens)
            {"ref": "CB-2026-1003", "type": "CASHBACK", "dir": "CREDIT", "amt": Decimal("150.0000"), "rem": "Weekly volume cashback dividend - 03 Oct 2026", "dt": datetime(2026, 10, 3, 12, 0, tzinfo=timezone.utc)},
            {"ref": "CB-2026-1010", "type": "CASHBACK", "dir": "CREDIT", "amt": Decimal("150.0000"), "rem": "Weekly volume cashback dividend - 10 Oct 2026", "dt": datetime(2026, 10, 10, 12, 0, tzinfo=timezone.utc)},
            {"ref": "CB-2026-1017", "type": "CASHBACK", "dir": "CREDIT", "amt": Decimal("150.0000"), "rem": "Weekly volume cashback dividend - 17 Oct 2026", "dt": datetime(2026, 10, 17, 12, 0, tzinfo=timezone.utc)},
            {"ref": "CB-2026-1024", "type": "CASHBACK", "dir": "CREDIT", "amt": Decimal("150.0000"), "rem": "Weekly volume cashback dividend - 24 Oct 2026", "dt": datetime(2026, 10, 24, 12, 0, tzinfo=timezone.utc)},
            # Deductions
            {"ref": "DED-2026-001", "type": "DEDUCTION", "dir": "DEBIT", "amt": Decimal("35.0000"), "rem": "System Maintenance & Node Security Reserve", "dt": datetime(2026, 10, 20, 18, 0, tzinfo=timezone.utc)},
            {"ref": "DED-2026-002", "type": "DEDUCTION", "dir": "DEBIT", "amt": Decimal("25.0000"), "rem": "Network Vault Service Fee", "dt": datetime(2026, 10, 5, 18, 0, tzinfo=timezone.utc)},
            # Transfers Out / In
            {"ref": "TX-8921-946", "type": "TRANSFER_OUT", "dir": "DEBIT", "amt": Decimal("450.0000"), "rem": "Peer-to-peer liquidity allocation to RZ-8943", "dt": datetime(2026, 10, 21, 16, 20, tzinfo=timezone.utc)},
        ]
        for tx in sample_txs:
            existing_tx = db.scalar(select(Transaction).where(Transaction.reference == tx["ref"]))
            if not existing_tx:
                db.add(
                    Transaction(
                        reference=tx["ref"],
                        member_id=primary_member.id,
                        wallet_id=tx_wallet.id if tx_wallet else None,
                        tx_type=tx["type"],
                        direction=tx["dir"],
                        amount=tx["amt"],
                        status="COMPLETED",
                        remark=tx["rem"],
                        created_at=tx.get("dt", now),
                    )
                )

        # 5b. Persisted Token Transfers for Transfer Tokens Report & Module 11
        elena = member_map.get("RZ-8943")
        marcus = member_map.get("RZ-8944")
        if primary_member and elena:
            if not db.scalar(select(TokenTransfer).where(TokenTransfer.reference == "TRF-2026-001")):
                db.add(
                    TokenTransfer(
                        reference="TRF-2026-001",
                        sender_id=primary_member.id,
                        receiver_id=elena.id,
                        transfer_type="PEER_TO_PEER",
                        amount=Decimal("450.0000"),
                        status="COMPLETED",
                        created_at=datetime(2026, 10, 21, 16, 20, tzinfo=timezone.utc),
                    )
                )
        if primary_member and marcus:
            if not db.scalar(select(TokenTransfer).where(TokenTransfer.reference == "TRF-2026-002")):
                db.add(
                    TokenTransfer(
                        reference="TRF-2026-002",
                        sender_id=marcus.id,
                        receiver_id=primary_member.id,
                        transfer_type="PEER_TO_PEER",
                        amount=Decimal("300.0000"),
                        status="COMPLETED",
                        created_at=datetime(2026, 10, 23, 11, 15, tzinfo=timezone.utc),
                    )
                )

        # 6. Deposit and Withdrawal Requests
        if not db.scalar(select(DepositRequest).where(DepositRequest.reference == "DEP-2026-001")):
            db.add(
                DepositRequest(
                    reference="DEP-2026-001",
                    member_id=primary_member.id,
                    amount=Decimal("5000.0000"),
                    currency="USDT",
                    status="APPROVED",
                    review_note="Verified blockchain deposit transaction receipt",
                )
            )

        if tx_wallet and not db.scalar(select(WithdrawalRequest).where(WithdrawalRequest.reference == "WTH-2026-001")):
            db.add(
                WithdrawalRequest(
                    reference="WTH-2026-001",
                    member_id=primary_member.id,
                    wallet_id=tx_wallet.id,
                    amount=Decimal("1200.0000"),
                    destination_address="0x71C...849b2",
                    status="PROCESSING",
                    review_note="Scheduled for settlement batch",
                )
            )

        # 7. Support Ticket
        if not db.scalar(select(SupportTicket).where(SupportTicket.ticket_number == "TKT-1001")):
            db.add(
                SupportTicket(
                    ticket_number="TKT-1001",
                    member_id=primary_member.id,
                    subject="Two-Factor Hardware Key Registration",
                    description="Requesting confirmation of hardware token backup for vault withdrawals.",
                    priority="HIGH",
                    status="RESOLVED",
                )
            )

        # 8. Module 6 Profile: Nominee & Wallet Address for Primary Member
        if primary_member:
            if not db.scalar(select(Nominee).where(Nominee.member_id == primary_member.id)):
                db.add(
                    Nominee(
                        member_id=primary_member.id,
                        full_name="Eleanor Sterling",
                        relationship="Spouse",
                        contact_number="+1-555-0199",
                    )
                )

            if not db.scalar(select(MemberWalletAddress).where(MemberWalletAddress.member_id == primary_member.id)):
                db.add(
                    MemberWalletAddress(
                        member_id=primary_member.id,
                        network="USDT_BEP20",
                        wallet_address="0x71C8F7965F4d55b8e9b11cf298B30e462d142B29",
                        status="ACTIVE",
                    )
                )

            # Set a demo Riseup Key (PIN) for Johnathan Sterling
            primary_cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == primary_member.id))
            if primary_cred and not primary_cred.transaction_pin_hash:
                primary_cred.transaction_pin_hash = hash_password("894200")

        # 9. Module 8: Package & Rank Upgrade Requests
        diamond_pkg = package_map.get("DIAMOND")
        platinum_pkg = package_map.get("PLATINUM")
        gold_pkg = package_map.get("GOLD")
        elena = member_map.get("RZ-8943")

        if primary_member and diamond_pkg and platinum_pkg:
            if not db.scalar(select(UpgradeRequest).where(UpgradeRequest.reference == "UPG-2026-001")):
                db.add(
                    UpgradeRequest(
                        reference="UPG-2026-001",
                        member_id=primary_member.id,
                        current_package_id=platinum_pkg.id,
                        target_package_id=diamond_pkg.id,
                        upgrade_amount=diamond_pkg.upgrade_amount or Decimal("250000.00"),
                        status="APPROVED",
                        review_note="Executive tier achievement criteria validated and verified by board.",
                        created_at=now - timedelta(days=25),
                    )
                )

        if elena and diamond_pkg and platinum_pkg:
            if not db.scalar(select(UpgradeRequest).where(UpgradeRequest.reference == "UPG-2026-002")):
                db.add(
                    UpgradeRequest(
                        reference="UPG-2026-002",
                        member_id=elena.id,
                        current_package_id=platinum_pkg.id,
                        target_package_id=diamond_pkg.id,
                        upgrade_amount=diamond_pkg.upgrade_amount or Decimal("250000.00"),
                        status="PENDING",
                        review_note="Awaiting node volume verification from manager.",
                        created_at=now - timedelta(days=2),
                    )
                )

        db.commit()
        logger.info("Successfully seeded Riseupzed demo database records.")

    except Exception as exc:
        db.rollback()
        logger.error(f"Error seeding database: {exc}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
