# Project Architecture

## 1. Final project architecture

The system is structured as a clean three-layer architecture with explicit separation of concerns:

Frontend (React + TypeScript + Vite)
↓
Backend API (FastAPI + Python)
↓
Business Services / Domain Logic
↓
PostgreSQL / SQLite Database
↓
AI/ML Module (Python, pandas, NumPy, scikit-learn)

This design keeps the user interface, verification logic, database access, and ML processing independent so each part can be tested and evolved separately.

## 2. Technology stack

### Frontend
- React 18
- TypeScript 5
- Vite 6
- Lucide React icons
- Native fetch API

### Backend
- Python 3.13+
- FastAPI
- Pydantic v2
- SQLAlchemy 2 / Alembic
- PostgreSQL driver (psycopg) / SQLite for local dev
- JWT authentication (python-jose)
- Password hashing (passlib / bcrypt)
- Rate limiting (slowapi)

### Database
- PostgreSQL (production)
- SQLite (local development, zero-dependency)
- Migrations via Alembic

### AI / ML
- Python
- pandas
- NumPy
- scikit-learn
- joblib

### DevOps / tooling
- Docker / Docker Compose
- Git / GitHub
- pytest

## 3. Folder structure

```text
LandGuard-AI/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/    # REST endpoints (auth, parcels, transactions, cases...)
│   │   ├── core/             # Settings, RBAC roles, JWT security
│   │   ├── db/               # Engine session, init_db, seed data
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic: verification, risk, audit, auth
│   │   └── main.py           # FastAPI entrypoint
│   ├── alembic.ini           # Backend migration config
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── lib/api.ts        # Typed API client
│   │   ├── App.tsx           # Institutional dashboard & views
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # Shared TypeScript types
│   │   └── styles.css        # Professional UI design system
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── ml/
│   ├── data/                 # Synthetic land transaction datasets
│   ├── models/               # Serialized model & metrics.json
│   ├── scripts/              # Dataset generation tools
│   ├── training/             # Model training & comparative evaluation
│   ├── evaluation/           # Model comparison utilities
│   ├── notebooks/            # Jupyter notebooks for EDA
│   └── predict.py            # Prediction service
├── database/
│   ├── migrations/           # Alembic revision scripts
│   ├── seed/                 # Seed data documentation
│   └── erd.md                # Entity relationship documentation
├── docs/                     # Academic architecture, security, database & API docs
├── scripts/                  # Utility scripts for development
├── tests/                    # Automated pytest test suites
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── docker-compose.yml        # Docker orchestration
├── alembic.ini               # Root-level Alembic config
├── pytest.ini                # Pytest configuration
└── README.md                 # Project overview and setup guide
```

## 4. Database entities and relationships

### Core tables
- `users`
- `roles`
- `user_roles`
- `parcels`
- `owners`
- `ownership_history`
- `transactions`
- `verification_results`
- `risk_predictions`
- `case_reviews`
- `audit_logs`

### Relationship summary
- One user can create many transactions and audit records
- One parcel has many ownership history records
- One parcel has many transactions
- One owner can be associated with many parcels and ownership history entries
- One transaction can produce many verification results and one risk analysis record
- One case review is linked to one transaction and one parcel

## 5. User roles and permissions

### ADMIN
- manage users and roles
- system configuration
- view audit logs
- global statistics

### OFFICER
- search parcels and ownership records
- create and manage verification cases
- run verification rules
- run AI risk analysis
- review suspicious transactions
- add notes and update case workflow

### AUDITOR
- read-only review permissions
- view transactions, verification data, risk results, and logs
- generate reports
- no mutation of sensitive records unless explicitly authorized

## 6. Main system workflow

1. User logs in with secure credentials
2. Authorized user searches for a parcel or transaction
3. The system pulls parcel, ownership, and transaction data
4. Verification rules are executed
5. Duplicate/conflicting transaction checks are evaluated
6. AI module calculates a risk score and explanation
7. Officer reviews flagged case and updates workflow
8. Audit logs record every relevant action

## 7. AI / ML workflow

1. Load or generate synthetic dataset
2. Validate data quality and schema
3. Engineer features such as seller-owner match and duplicate detection flags
4. Split into train/test sets
5. Train models: logistic regression, decision tree, random forest
6. Evaluate precision, recall, F1, accuracy, and confusion matrix
7. Compare model performance
8. Save the best-performing model
9. Generate explanations from rule results and feature importance
10. Expose the model through a backend prediction endpoint

## 8. API plan

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Users and roles
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/{user_id}`
- `PUT /api/users/{user_id}`
- `DELETE /api/users/{user_id}`
- `POST /api/users/{user_id}/reactivate`

### Parcels and owners
- `GET /api/parcels`
- `GET /api/parcels/{parcel_id}`
- `POST /api/parcels`
- `PUT /api/parcels/{parcel_id}`
- `GET /api/parcels/{parcel_id}/ownership-history`
- `POST /api/parcels/{parcel_id}/ownership-history`
- `GET /api/parcels/{parcel_id}/transactions`
- `GET /api/owners`
- `POST /api/owners`
- `GET /api/owners/{owner_id}`
- `PUT /api/owners/{owner_id}`

### Transactions and verification
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/transactions/{transaction_id}`
- `GET /api/transactions/{transaction_id}/verification`
- `POST /api/verification`
- `POST /api/verification/transactions/{transaction_id}`
- `POST /api/risk-analysis`
- `POST /api/risk-analysis/transactions/{transaction_id}`
- `GET /api/risk-analysis/transactions/{transaction_id}`

### Cases and audit
- `GET /api/cases`
- `GET /api/cases/{case_id}`
- `PUT /api/cases/{case_id}`
- `GET /api/audit-logs`
- `GET /api/reports/verification`
- `GET /api/reports/risk`
- `GET /api/reports/cases`
- `GET /api/reports/audit`
- `GET /api/reports/parcels/{parcel_id}/history`

## 9. Development phases

1. Requirements analysis and ambiguity review
2. System architecture definition
3. Database and ERD design
4. Backend scaffold and migrations
5. Authentication and RBAC
6. Parcel and owner modules
7. Ownership history
8. Transaction management
9. Rule-based verification
10. Synthetic dataset generation
11. Model training and evaluation
12. AI prediction exposure through API
13. Dashboard and management UI
14. Verification and risk interface
15. Case review and auditing
16. Integration and QA
17. Security review
18. Documentation and demonstration prep

## 10. Potential technical risks

- incomplete or inconsistent land transaction data
- synthetic data not reflecting real-world patterns
- class imbalance in fraud-risk datasets
- false positives causing unnecessary review
- false negatives allowing risky transactions through
- permission mistakes in RBAC implementation
- audit log storage and retention design

## 11. Data limitations

- Synthetic data is used for academic prototyping because no official dataset is provided
- The prototype should not claim legal or governmental truth
- Missing or partial records may reduce model reliability
- The model is a decision-support tool, not a legal adjudication system

## 12. Security considerations

- use secure JWT secret management
- reject hard-coded credentials
- hash passwords with Argon2 or bcrypt
- validate all input using Pydantic and API validators
- configure CORS carefully
- sanitize logs to avoid storing sensitive personal data
- enforce authorization checks per route
- use database transactions for writes
- apply rate limiting for auth and public endpoints
- maintain audit logs for all critical actions

## 13. Decision note

The design intentionally separates raw verification rules from AI scoring. This matters because the rules explain what was checked, while the model provides a risk estimation. The combined approach improves transparency, accountability, and trust for an academic decision-support system.
