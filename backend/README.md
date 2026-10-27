# Riseupzed — Backend & Database Foundation (Module 3)

FastAPI & PostgreSQL service foundation for the Riseupzed platform demo. Provides typed API endpoints, Alembic migrations, database models, deterministic demo data seeding, and automated health checks.

---

## 1. Prerequisites & System Requirements

- **Python**: Version `3.10+` (Tested and verified on Python `3.13.0`)
- **PostgreSQL**: Version `14+` (Tested and verified with PostgreSQL `17` / `18`)
- **Node.js & npm**: For running the companion React frontend (`v18+`)

---

## 2. Architecture Overview

```text
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint, CORS & error handlers
│   ├── core/
│   │   ├── config.py            # Pydantic v2 Settings, CORS parsing & safe URLs
│   │   ├── logging.py           # Structured application logging
│   │   └── exceptions.py        # Centralized domain and HTTP exceptions
│   ├── db/
│   │   ├── base.py              # SQLAlchemy 2.0 Base with UTC TimestampMixin
│   │   ├── session.py           # Engine pool, SessionLocal, and DB ping health check
│   │   ├── init_db.py           # Database existence bootstrap utility
│   │   └── models/              # Clean relational models (all using UUID keys & DECIMAL amounts)
│   │       ├── package.py       # VIP Packages (Starter, Silver, Gold, Platinum, Diamond)
│   │       ├── member.py        # Members (Alex Vance Manager, Johnathan Sterling, etc.)
│   │       ├── organization.py  # Binary Left/Right organization relationships
│   │       ├── wallet.py        # Transaction, Mother, and Staking wallets
│   │       ├── transaction.py   # Atomic transaction ledger (DEPOSIT, CASHBACK, MATCHING)
│   │       ├── deposit.py       # Deposit verification requests
│   │       ├── withdrawal.py    # Withdrawal queue requests
│   │       ├── transfer.py      # Internal token transfers
│   │       └── support.py       # Support tickets
│   ├── schemas/                 # Validated Pydantic response/request models
│   │   ├── common.py            # Generic PaginatedResponse[T]
│   │   ├── health.py            # Health & DB connectivity schema
│   │   ├── package.py           # Package response schemas
│   │   ├── member.py            # Member profile schemas
│   │   └── organization.py      # Binary node hierarchy schemas
│   ├── api/
│   │   ├── router.py            # Central /api/v1 router
│   │   └── routes/
│   │       ├── health.py        # GET /api/v1/health & GET /api/v1/health/db
│   │       ├── packages.py      # GET /api/v1/packages
│   │       ├── members.py       # GET /api/v1/members & GET /api/v1/members/{id}
│   │       └── organization.py  # GET /api/v1/organization/{parent_id}
│   ├── seed/
│   │   └── seed_data.py         # Deterministic, repeatable demo data seeder
│   └── tests/                   # Pytest automated test suite (14 passing tests)
│       ├── conftest.py          # Isolated test database and TestClient fixture
│       ├── test_health.py       # API & database health connectivity verification
│       ├── test_packages.py     # Package ordering, display prices, and active filter
│       ├── test_members.py      # Pagination, lookups by code/UUID, and 404 handling
│       └── test_seed.py         # Seed script idempotence & binary organization tree
├── alembic/
│   ├── env.py                   # Alembic environment linked to settings.DATABASE_URL
│   └── versions/
│       └── 001_initial_schema.py# Full initial DDL migration with all 9 tables & indexes
├── alembic.ini                  # Migration configuration
├── pytest.ini                   # Pytest discovery configuration
├── requirements.txt             # Python dependencies
├── .env.example                 # Safe environment configuration template
└── README.md
```

---

## 3. Local Setup Instructions

### Step 1: Create and Activate Virtual Environment

**Windows PowerShell:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

Ensure the `DATABASE_URL` matches your local PostgreSQL instance:
```ini
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/riseupzed_db"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
```

### Step 4: Create the Database

Run the database bootstrap script:
```powershell
python -m app.db.init_db
```

### Step 5: Run Alembic Migrations

Apply the migration to create all tables:
```powershell
alembic upgrade head
```

To inspect generated SQL without modifying the database:
```powershell
alembic upgrade --sql base:head
```

### Step 6: Seed Realistic Demo Data

Populate the database with sample packages, members, binary organization placements, wallets, transactions, and support tickets:
```powershell
python -m app.seed.seed_data
```
*(The seed script is idempotent and can be run multiple times safely without duplicating records.)*

### Step 7: Start the FastAPI Server

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 4. API Endpoints Reference

Once running, interactive documentation is available at:
- **Interactive Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc Documentation**: `http://localhost:8000/api/v1/redoc`
- **OpenAPI Schema**: `http://localhost:8000/api/v1/openapi.json`

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service root metadata & version |
| `GET` | `/api/v1/health` | Basic application process health check |
| `GET` | `/api/v1/health/db` | Real PostgreSQL ping check measuring query round-trip latency |
| `GET` | `/api/v1/packages` | List of packages with prices, display names, and sort order |
| `GET` | `/api/v1/members` | Paginated member listing (`?page=1&limit=10&status=ACTIVE`) |
| `GET` | `/api/v1/members/{id_or_code}` | Lookup demo member by UUID or member code (e.g., `RZ-8942`) |
| `GET` | `/api/v1/organization/{parent_id}` | Query direct LEFT and RIGHT child placements for tree view |

---

## 5. Running Automated Tests

Run the full pytest suite:
```powershell
pytest -v
```

All 14 test cases execute in an isolated environment and verify:
- API root and health check endpoint functionality
- Database health success and safe 503 error handling without leaking credentials or stack traces
- Package retrieval and ordering
- Member pagination and lookup by code and UUID
- Clean 404 responses for non-existent entities
- Seed data idempotency and repeatable executions
- Organization binary tree queries

---

## 6. Frontend Integration

In the root frontend directory (`riseupzed/`):
Ensure `.env` contains:
```ini
VITE_API_BASE_URL=http://localhost:8000
```
Navigate to `http://localhost:5173/dev/backend-status` to inspect live connectivity status, latency diagnostics, and sample record counts directly inside the frontend shell.
