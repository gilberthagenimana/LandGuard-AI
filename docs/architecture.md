# Project Architecture

## 1. Final project architecture

The system is structured as a clean three-layer architecture with explicit separation of concerns:

Frontend (Next.js + TypeScript + Tailwind)
↓
Backend API (FastAPI + Python)
↓
Business Services / Domain Logic
↓
PostgreSQL Database
↓
AI/ML Module (Python, pandas, NumPy, scikit-learn)

This design keeps the user interface, verification logic, database access, and ML processing independent so each part can be tested and evolved separately.

## 2. Recommended technology stack

### Frontend
- React
- Next.js
- TypeScript
- Tailwind CSS
- Axios or native fetch

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy / Alembic
- PostgreSQL driver
- JWT authentication
- Password hashing with Argon2 or bcrypt

### Database
- PostgreSQL
- migrations via Alembic

### AI / ML
- Python
- pandas
- NumPy
- scikit-learn
- joblib or pickle

### DevOps / tooling
- Docker
- Git
- GitHub
- pytest

## 3. Folder structure

```text
land-fraud-detection/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routes/
│   │   │       └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── auth/
│   │   │   ├── parcels/
│   │   │   ├── owners/
│   │   │   ├── transactions/
│   │   │   ├── verification/
│   │   │   ├── fraud_risk/
│   │   │   ├── reviews/
│   │   │   └── audit/
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   ├── main.py
│   │   └── __init__.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── ml/
│   ├── data/
│   ├── models/
│   ├── notebooks/
│   ├── train_model.py
│   └── predict.py
├── database/
│   ├── migrations/
│   ├── schema.sql
│   ├── erd.md
│   └── seed_data.py
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── security.md
│   ├── ai-methodology.md
│   └── phase-1-requirements-analysis.md
├── tests/
│   ├── api/
│   ├── auth/
│   ├── ml/
│   └── verification/
├── scripts/
│   └── setup.sh
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── .gitignore
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
- `verification_rules`
- `verification_results`
- `risk_analysis`
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

### VERIFICATION_OFFICER
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
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users and roles
- `GET /users`
- `POST /users`
- `GET /users/{user_id}`
- `PUT /users/{user_id}`

### Parcels and owners
- `GET /parcels`
- `GET /parcels/{parcel_id}`
- `POST /parcels`
- `GET /parcels/{parcel_id}/ownership-history`
- `GET /parcels/{parcel_id}/transactions`

### Transactions and verification
- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{transaction_id}`
- `POST /verification`
- `POST /risk-analysis`

### Cases and audit
- `GET /cases`
- `GET /cases/{case_id}`
- `PUT /cases/{case_id}`
- `GET /audit-logs`
- `GET /reports`

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
