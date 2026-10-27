import time
from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": settings.DB_POOL_PRE_PING,
}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for injecting database sessions per request with automatic teardown."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connectivity() -> Dict[str, Any]:
    """Execute ping query against database engine and measure response latency."""
    start_time = time.perf_counter()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        db_type = "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite"
        return {
            "status": "healthy",
            "database": db_type,
            "connected": True,
            "latency_ms": latency_ms,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    except Exception as exc:
        logger.warning(f"Database connectivity check failed: {exc}")
        return {
            "status": "unhealthy",
            "database": "unknown",
            "connected": False,
            "latency_ms": 0,
            "error": "Database service is not reachable or responding to query ping.",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
