# LandGuard AI: An AI-Powered Land Transaction Verification and Fraud Risk Detection System

Academic graduation project prototype designed for land transaction verification and fraud risk detection in Rwanda.

---

## 1. Project Overview

LandGuard AI is a secure, web-based decision-support platform designed to assist land registrars and verification officers in analyzing land transactions, verifying ownership continuity, detecting conflicting claims, and evaluating transaction fraud risk through a combination of deterministic business rules and machine-learning risk estimation.

> [!IMPORTANT]
> **Institutional & Legal Disclaimer**:
> This system is a decision-support prototype. It does **not** replace official Rwandan land authorities (such as the National Land Authority). It does **not** legally determine ownership or declare any individual a fraudster. AI results represent risk indicators only; final determinations remain with authorized human officers and official legal processes.

---

## 2. Problem Statement

In rapidly developing land registries, conveyance transactions are susceptible to operational and fraud risks:
1. Sellers attempting to convey parcels without registered title or authorized power of attorney.
2. Concurrent, conflicting, or duplicate sale agreements for the same parcel.
3. Rapid succession ownership flips concealing title defects.
4. Irregular transaction velocities indicating speculative or unauthorized activities.
5. Inconsistencies between recorded cadastral bounds and submitted application data.

---

## 3. Main Objectives

- **Automate Verification**: Deterministically check 9 domain rules across parcels, owners, and active applications.
- **Conflict Detection**: Identify conflicting buyer claims and duplicate active transactions.
- **Explainable AI Risk Scoring**: Estimate transaction risk (0–100) and risk level (`LOW`, `MEDIUM`, `HIGH`) with plain-language indicator rationales.
- **Human-in-the-Loop Workflow**: Escalate flagged transactions into an officer case review pipeline.
- **Audit & Compliance**: Maintain immutable, append-only logs for all sensitive queries, status transitions, and reviews.

---

## 4. Key Features

- **Multi-Role Authentication & RBAC**: Dedicated permissions for `ADMIN`, `OFFICER`, and `AUDITOR`.
- **Cadastral & Title Tracking**: Detailed parcel cards with province, district, sector, cell, village, and surface area.
- **Ownership Lineage Timeline**: Chronological tracking of every title transfer, deed, and legal conveyance reason.
- **9-Rule Verification Engine**: Immediate evaluation of seller identity, parcel status, concurrent claims, and velocity.
- **Calibrated ML Model**: Trained on realistic transaction patterns with weighted precision and recall evaluation.
- **Interactive Case Review**: Investigation notes, assignee tracking, and status progression (`OPEN` → `UNDER_REVIEW` → `RESOLVED`).
- **Institutional Reporting**: Printable/exportable verification reports, risk summaries, case logs, and parcel conveyance certificates.

---

## 5. System Architecture

LandGuard AI follows a modular three-tier architecture:
- **Frontend Presentation**: React 18, TypeScript, Tailwind CSS concepts, and Vite.
- **API & Domain Services**: Python FastAPI, Pydantic v2 validation, SQLAlchemy ORM, and SlowAPI rate-limiting.
- **Persistence Layer**: Relational database supporting SQLite for local zero-dependency development and PostgreSQL for institutional deployments.
- **AI/ML Engine**: Scikit-Learn pipeline (Random Forest champion model) with calibrated probability-to-score transformation.

---

## 6. Technology Stack

- **Frontend**: React 18, TypeScript 5, Vite 6, Lucide React icons
- **Backend**: Python 3.13+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic
- **Machine Learning**: scikit-learn, pandas, NumPy, joblib
- **Security**: JWT (`python-jose`), `passlib` (Argon2 / bcrypt), SlowAPI
- **Testing**: Pytest, Pytest-asyncio, HTTPX
- **Database**: PostgreSQL / SQLite (dual driver support)

---

## 7. Folder Structure

```text
LandGuard-AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/    # REST endpoints (auth, parcels, transactions, cases...)
│   │   ├── core/             # Settings, RBAC roles, JWT security
│   │   ├── db/               # Engine session, init_db, seed data
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic: verification, risk, audit
│   │   └── main.py           # FastAPI entrypoint
│   ├── alembic.ini           # Backend migration config
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── lib/api.ts        # Typed API client
│   │   ├── App.tsx           # Institutional dashboard & views
│   │   └── styles.css        # Professional UI design system
│   └── package.json          # Node dependencies
├── ml/
│   ├── data/                 # Synthetic land transaction datasets
│   ├── models/               # Serialized model & metrics.json
│   ├── scripts/              # Dataset generation tools
│   ├── training/             # Model training & comparative evaluation
│   └── predict.py            # Prediction service
├── database/
│   ├── migrations/           # Alembic revision scripts
│   └── erd.md                # Entity relationship documentation
├── docs/                     # Academic architecture, security, database & API docs
├── tests/                    # Automated pytest test suites
└── pytest.ini                # Pytest configuration
```

---

## 8. Database Setup

### Local SQLite (Default)
No setup required. The application automatically initializes `landguard_ai.db` with demo seed data upon startup or migration execution:
```powershell
.\.venv\Scripts\alembic.exe upgrade head
```

### PostgreSQL Setup
1. Create a PostgreSQL database (e.g. `land_verification`).
2. Update `DATABASE_URL` in `.env`:
   ```ini
   DATABASE_URL=postgresql+psycopg2://landuser:landpass@localhost:5432/land_verification
   ```
3. Run migrations and seed default records:
   ```powershell
   .\.venv\Scripts\alembic.exe upgrade head
   .\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db()"
   ```

---

## 9. Environment Setup

Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Ensure `JWT_SECRET_KEY` is configured securely for non-development environments.

---

## 10. Backend Setup

From the repository root using the existing virtual environment:
```powershell
cd backend
..\.venv\Scripts\pip.exe install -r requirements.txt
```

---

## 11. Frontend Setup

From the `frontend` folder:
```powershell
cd frontend
npm install
npm run build
```

---

## 12. AI / ML Setup

To regenerate the synthetic training data and retrain candidate models:
```powershell
.\.venv\Scripts\python.exe -m ml.scripts.generate_dataset --output ml/data/synthetic_land_transactions.csv --rows 1200
.\.venv\Scripts\python.exe -m ml.training.train --dataset ml/data/synthetic_land_transactions.csv --model-dir ml/models
```

---

## 13. Running the Application

### Start Backend (Port 8000)
```powershell
cd backend
..\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI available at: `http://localhost:8000/docs`

### Start Frontend (Port 5173 / 3000)
```powershell
cd frontend
npm run dev
```

---

## 14. Running Automated Tests

Run the complete test suite:
```powershell
.\.venv\Scripts\pytest.exe -v
```

---

## 15. API Documentation

Comprehensive endpoint specifications are documented in [`docs/api.md`](file:///d:/LandGuard%20AI/docs/api.md) and interactive documentation is available live at `http://localhost:8000/docs`.

---

## 16. Demo Credentials

The database is seeded with realistic demonstration accounts:

| Role | Username | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin@landguard.local` | `AdminPass123!` | User management, audit logs, system configuration |
| **Verification Officer** | `officer` | `officer@landguard.local` | `OfficerPass123!` | Verification execution, AI risk analysis, case review |
| **Auditor** | `auditor` | `auditor@landguard.local` | `AuditorPass123!` | Read-only compliance review, audit log access, reports |

---

## 17. Dataset Explanation

> [!NOTE]
> All parcel codes, owner names, national identification references, and transactions in `ml/data/synthetic_land_transactions.csv` and seed scripts are **100% synthetic**. They were mathematically generated for academic experimentation and modeling. They do **not** represent real people or official Rwandan government records.

---

## 18. Security Specifications

Detailed in [`docs/security.md`](file:///d:/LandGuard%20AI/docs/security.md):
- Constant-time password hashing (Argon2 / bcrypt).
- Signed JWT access tokens with 60-minute expiry.
- Role-Based Access Control enforced at the API route layer.
- SlowAPI request throttling for brute-force mitigation.
- Parameterized ORM queries eliminating SQL injection.

---

## 19. Project Limitations

1. **Academic Decision-Support Prototype**: The system is designed to highlight anomalies for human review, not issue legally binding decrees.
2. **Synthetic Data**: Trained on statistically synthetic conveyance records due to confidentiality and privacy constraints of official cadastral datasets.
3. **No Direct Hardware Biometrics**: Citizen identification relies on alphanumeric reference numbers rather than real-time biometric sensors.

---

## 20. Future Improvements

1. Integration with official NLA (National Land Authority) and Irembo REST gateways under formal bilateral API agreements.
2. Support for geospatial polygon shapefiles (GIS mapping) to visually identify physical parcel overlaps.
3. Multi-factor authentication (MFA / TOTP) for sensitive officer sign-offs.
4. Distributed Celery task queues for high-volume batch risk evaluations.
