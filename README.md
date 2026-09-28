# LandGuard AI: An AI-Powered Land Transaction Verification and Fraud Risk Detection System

Academic graduation project prototype designed for land transaction verification and fraud risk detection in Rwanda.

---

## Project Repositories

| Repository | Description | Link |
|---|---|---|
| **Backend** | FastAPI API, ML Pipeline, Database | https://github.com/gilberthagenimana/landguard-ai-backend |
| **Frontend** | React Dashboard | https://github.com/gilberthagenimana/landguard-ai-frontend |

---

## Project Overview

LandGuard AI is a secure, web-based decision-support platform designed to assist land registrars and verification officers in analyzing land transactions, verifying ownership continuity, detecting conflicting claims, and evaluating transaction fraud risk through a combination of deterministic business rules and machine-learning risk estimation.

> [!IMPORTANT]
> **Institutional & Legal Disclaimer**:
> This system is a decision-support prototype. It does **not** replace official Rwandan land authorities (such as the National Land Authority). It does **not** legally determine ownership or declare any individual a fraudster. AI results represent risk indicators only; final determinations remain with authorized human officers and official legal processes.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 6, Lucide React |
| **Backend** | Python 3.13+, FastAPI, Pydantic v2, SQLAlchemy 2 |
| **Database** | PostgreSQL (Neon) / SQLite (local dev) |
| **ML/AI** | scikit-learn, pandas, NumPy, joblib |
| **Security** | JWT (python-jose), bcrypt (passlib), SlowAPI |
| **Testing** | pytest, Pytest-asyncio, HTTPX |
| **Deployment** | Docker, Docker Compose |

---

## Quick Start

### Option 1: Run Both Services

**Terminal 1 — Backend:**
```powershell
cd landguard-ai-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```powershell
cd landguard-ai-frontend
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Docker Compose

```powershell
docker-compose up --build
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@landguard.local` | `AdminPass123!` |
| **Verification Officer** | `officer@landguard.local` | `OfficerPass123!` |
| **Auditor** | `auditor@landguard.local` | `AuditorPass123!` |

---

## Key Features

- **Multi-Role Authentication & RBAC**: ADMIN, OFFICER, AUDITOR
- **Cadastral & Title Tracking**: Province, district, sector, cell, village
- **Ownership Lineage Timeline**: Chronological title transfer tracking
- **9-Rule Verification Engine**: Seller identity, conflicts, velocity
- **Calibrated ML Model**: Random Forest with explainable risk scoring
- **Interactive Case Review**: Notes, assignee, status progression
- **Institutional Reporting**: Verification, risk, cases, audit reports
- **Cloud Database**: Neon PostgreSQL for production deployment

---

## Project Structure

```
LandGuard-AI/
├── landguard-ai-backend/          # Backend repository
│   ├── backend/                   # FastAPI application
│   ├── ml/                        # ML pipeline
│   ├── database/                  # Migrations & seed
│   ├── tests/                     # Test suite
│   └── README.md
├── landguard-ai-frontend/         # Frontend repository
│   ├── frontend/                  # React application
│   └── README.md
├── docs/                          # Academic documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── ai-model.md
│   ├── security.md
│   └── testing.md
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Dataset Explanation

> [!NOTE]
> All parcel codes, owner names, national identification references, and transactions are **100% synthetic**. They were mathematically generated for academic experimentation and modeling. They do **not** represent real people or official Rwandan government records.

---

## Security Specifications

- Constant-time password hashing (bcrypt)
- Signed JWT access tokens with 60-minute expiry
- Role-Based Access Control enforced at the API route layer
- SlowAPI request throttling for brute-force mitigation
- Parameterized ORM queries eliminating SQL injection
- Neon PostgreSQL with SSL/TLS encryption

---

## Project Limitations

1. **Academic Decision-Support Prototype**: Not a legally binding system
2. **Synthetic Data**: No official government data used
3. **No Direct Hardware Biometrics**: Alphanumeric ID references only
4. **Cloud Database**: Requires internet connection for Neon PostgreSQL

---

## Future Improvements

1. Integration with official NLA (National Land Authority) REST APIs
2. GIS mapping with geospatial polygon support
3. Multi-factor authentication (MFA / TOTP)
4. Celery task queues for batch risk evaluations
5. CI/CD pipeline with GitHub Actions

---

## License

Academic project for graduation purposes.
