# Riseupzed — Official Website Demo & Executive Staking Platform

A full-stack, responsive, database-backed demonstration platform for the Riseupzed executive staking and community networking portal. Built to faithfully reproduce the visual design, organization hierarchy, financial reports, peer transfers, and support workflows from official RiseUpzed reference specifications without fabricated financial claims or undocumented business rules.

---

## 💎 Visual Direction & Design System

The application adheres to the Riseupzed luxury dark aesthetic:
- **Midnight Black & Deep Purple Foundation:** Dark surfaces (`#080817`, `#101024`, `#17112F`, `#20183B`) with subtle glowing borders and depth.
- **Electric Cyan Accents:** Restrained cyber cyan highlights (`#22D3EE`) for tabular numbers, active badges, and focus rings.
- **Selective Gold Highlights:** Refined warm luxury gold (`#F5C451`) reserved for executive tiers and VIP accents.
- **Official Branding:** Integrated official 3D gold RiseUpzed emblem and logomark across all public and authenticated navigation headers.
- **Accessibility & Motion:** Full WCAG AA contrast compliance, keyboard focus rings, and `prefers-reduced-motion` compliance.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Vanilla CSS design tokens + Tailwind CSS
- **Routing:** React Router v6
- **Icons & Animation:** Lucide React, Framer Motion
- **Data & Forms:** Centralized Typed API Client, React Hook Form, Zod

### Backend
- **Framework:** Python 3.13, FastAPI, Pydantic v2
- **ORM & Database:** SQLAlchemy 2.0, PostgreSQL (Production) / SQLite (Fast In-Memory Testing)
- **Session & Security:** Server-managed session tokens, HTTP-only session cookies, bcrypt password hashing, CSV formula injection sanitization
- **Testing:** Pytest (60 comprehensive unit & integration tests)

---

## 📦 Implemented Modules (1–12)

| Module | Name | Features & Scope |
| :--- | :--- | :--- |
| **Module 1** | Visual Foundation | Design tokens, color palette, dark/light themes, ambient particle background, 3D tilt cards. |
| **Module 2** | Application Shell | Responsive desktop sidebar, mobile navigation drawer, header breadcrumbs, session status indicator. |
| **Module 3** | Backend & Database | FastAPI server, SQLAlchemy models, deterministic database seeding, health diagnostics. |
| **Module 4** | Landing Page | Public showcase, hero presentation, staking statistics, package tier comparison, FAQ, dynamic login redirect. |
| **Module 5** | Authentication & RBAC | Server-managed session auth, Member vs Manager role boundaries, password verification, active session tracking. |
| **Module 6** | Member Dashboard & Profile | Authoritative balance metrics, quick actions, nominee management, BEP20 address binding, Riseup Key security PIN. |
| **Module 7** | Wallets & Financial Requests | Transaction, Mother, and Staking wallets; deposit request receipts; Saturday-only withdrawal scheduling and limits. |
| **Module 8** | Packages & Rank Upgrades | 5 staking packages (Starter, Silver, Gold, Platinum, Diamond); package upgrade workflow; manager audit approval queue. |
| **Module 9** | Organization Management | Left and Right team lists with search & pagination; interactive Binary Tree View with node inspection, connecting lines, and step-by-step breadcrumb navigation. |
| **Module 10** | Reports & Analytics | 8 dedicated reports (Multiple Matching, Re-Buy Matching, Withdrawals, Transfers, Weekly Cashback, Deductions, General Overview, Trimming); date-range validation; spreadsheet formula-injection safe CSV export. |
| **Module 11** | Token Transfers & Support | Authoritative available tokens; Self Transfer form (with unconfigured rule notice); verified User Transfer form with recipient lookup and double-entry atomic balance mutations; Support ticket creation, thread replies, and manager status updates. |
| **Module 12** | Integration, Testing & Deployment | 0 placeholder pages remaining across all routes; 60/60 pytest tests passing; production TypeScript build verified; deployment guidelines. |

---

## 📊 Module 10: Reports & Analytics Details

The application implements all 8 reference report types under `/app/reports`:
1. **Multiple Matching Incentive (`/app/reports/matching`):** Chronological log of binary pair matching bonus credits.
2. **Re-Buy Matching Incentive (`/app/reports/repurchase`):** Community repurchase and re-staking yield rewards.
3. **Withdraw Tokens Report (`/app/reports/withdrawals`):** Complete audit trail of submitted, pending, and settled token withdrawals with wallet addresses.
4. **Transfer Tokens (`/app/reports/transfers`):** Outgoing and incoming peer transfer records with counterparty details.
5. **Weekly Cashback Tokens (`/app/reports/cashback`):** Faithfully reproduces reference screenshot: 4 weekly records dated 3, 10, 17, and 24 October 2026, totaling 600.00 tokens with 4 successful credits, summary cards, and date filters.
6. **Deduction Report (`/app/reports/deductions`):** Itemized maintenance and network service fee deductions.
7. **General Report (`/app/reports/general`):** Master ledger overview with category cards, total entry counts, cumulative volumes, and recent cross-report activities.
8. **Trimming Report (`/app/reports/trimming`):** Faithfully reproduces reference screenshot empty state with page-size selector, refresh action, and export button.

### CSV Export & Security
All reports feature one-click CSV export with server-side formula injection sanitization. Any cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically escaped with `'` to prevent spreadsheet formula execution in Microsoft Excel, Google Sheets, and LibreOffice.

---

## 💸 Module 11: Token Transfers & Support Details

### Token Transfers (`/app/transfers`)
- **Available Authoritative Balance:** Live balance retrieved from server-managed Transaction Wallet.
- **Self Transfer Tokens:** Form with package selector, amount, and Riseup Key. As self-transfer rules are not established by reference specifications, submission is disabled with a transparent business rule notice.
- **User Transfer Tokens:** Peer-to-peer liquidity allocation. Includes live recipient validation (`/api/v1/transfers/lookup-recipient`) showing verified recipient name, positive amount validation, anti-overdraft checks, Riseup Key verification, confirmation modal, and atomic database execution with double-entry audit records.
- **Transfer History:** Tabs for "Transfers Sent" (outgoing) and "Transfers Received" (incoming) with clickable transaction receipt modals.

### Support Ticket System (`/app/support`)
- **Ticket Creation:** Subject, Category (Account, Wallet, Package & Rank, Organization, Reports, Technical Issue, Other), Priority (Low, Medium, High), and detailed description.
- **My Tickets List:** Status pills (Open, In Progress, Resolved, Closed), search by subject/ticket number, status filtering.
- **Conversation Thread Modal:** Complete message history with sender role badges (Member vs Support Manager), reply posting, and manager status transition controls.

---

## 🔒 Simulated Financial Application Notice

This application is a **simulated demonstration platform**:
- It **does not** connect to real blockchain networks or cryptocurrencies.
- It **does not** integrate real fiat payment gateways or external bank accounts.
- It **does not** initiate real cryptocurrency wallet signings or fund withdrawals.
- All balances, cashback distributions, and transfers represent simulated internal database ledger records.

---

## 🔑 Demo Accounts

Deterministic demo accounts are seeded automatically for testing:

| Role | Member Code | Identifier | Password | Demo Riseup Key (PIN) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Member** | `RZ-8942` | `RZ-8942` or `johnathan@riseupdemo.io` | `member123` | `894200` | Johnathan Sterling (Diamond VIP) |
| **Manager / Admin**| `RZ-1001` | `RZ-1001` or `manager@riseupdemo.io` | `manager123` | `100100` | Executive System Manager |
| **Downline Member**| `RZ-8943` | `RZ-8943` | `demo123` | — | Elena Vance (Left Organization) |
| **Downline Member**| `RZ-8944` | `RZ-8944` | `demo123` | — | Marcus Chen (Right Organization) |
| **Downline Member**| `RZ-8945` | `RZ-8945` | `demo123` | — | Sarah Al-Mansoor |
| **Downline Member**| `RZ-8946` | `RZ-8946` | `demo123` | — | David K. O'Connor |
| **Downline Member**| `RZ-8947` | `RZ-8947` | `demo123` | — | Amina Diallo |
| **Unplaced Member**| `RZ-8948` | `RZ-8948` | `demo123` | — | Tariq Malik |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ (tested with Node 20+)
- Python 3.10+ (tested with Python 3.13)
- PowerShell (Windows) or Bash (macOS/Linux)

### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed script
python -m app.seed.seed_data

# Start backend server (runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```powershell
# In a separate terminal at project root
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Testing & Verification

### Run Full Backend Test Suite
```powershell
.\backend\.venv\Scripts\python.exe -m pytest backend/app/tests -v
```
*Current test result: **60 passed** in 153.75s (100% passing across all 11 test modules).*

### Run Frontend Production Build & Typecheck
```powershell
npm run build
```
*Current build result: **0 type errors**, `tsc -b && vite build` completed in ~9.4s.*

---

## 🌐 Production Deployment Architecture

The application is structured for independent frontend and backend deployment:

```
[ Clients / Mobile / Desktop ]
              │
              ▼ HTTPS
[ Static Frontend Hosting (Vercel / Cloudflare Pages / AWS S3) ]
              │
              ▼ REST API (HTTPS / Bearer Auth)
[ FastAPI Backend (Render / Railway / AWS ECS / Fly.io) ]
              │
              ▼ Private Subnet (Connection Pooling)
[ Managed PostgreSQL Database (Neon / Supabase / RDS) ]
```

### Production Checklist
1. **Frontend Environment:** Configure `VITE_API_BASE_URL` with production API endpoint.
2. **Backend Environment:** Set `DATABASE_URL` pointing to managed PostgreSQL instance.
3. **CORS Origins:** Configure `CORS_ORIGINS` to only whitelist official frontend domain.
4. **HTTPS Cookies:** Set `ENVIRONMENT=production` in backend configuration so session cookies are marked `Secure; SameSite=Lax`.
5. **Database Migrations:** Run `alembic upgrade head` during deployment release phase. Do not execute seed scripts on production databases.
