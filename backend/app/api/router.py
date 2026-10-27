from fastapi import APIRouter
from app.api.routes import (
    health,
    packages,
    members,
    organization,
    auth,
    dashboard,
    profile,
    wallets,
    deposits,
    withdrawals,
    manager_financial,
    reports,
    transfers,
    support,
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(packages.router)
api_router.include_router(packages.manager_router)
api_router.include_router(members.router)
api_router.include_router(organization.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(profile.router)
api_router.include_router(wallets.router)
api_router.include_router(deposits.router)
api_router.include_router(withdrawals.router)
api_router.include_router(manager_financial.router)
api_router.include_router(reports.router)
api_router.include_router(transfers.router)
api_router.include_router(support.router)


