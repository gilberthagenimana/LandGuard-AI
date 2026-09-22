# AI-Powered Land Transaction Verification and Fraud Risk Detection System

This repository contains the initial architecture and implementation scaffold for an academic graduation project focused on land transaction verification and fraud-risk detection for Rwanda.

## Scope and boundaries

- Decision-support system for authorized users only
- AI predictions are advisory; they do not replace legal verification or official authority decisions
- Synthetic/demo data is clearly labeled and must not be confused with official land records
- The system is designed for a secure, modular, extensible prototype

## Project goal

Create a secure web application to support:

- parcel and ownership registration
- ownership history tracking
- transaction management
- rule-based verification checks
- AI risk scoring and explanations
- human review of flagged cases
- audit logging and reporting

## Suggested monorepo structure

- `backend/` — FastAPI application, business logic, API, auth, services, database models
- `frontend/` — Next.js + TypeScript + Tailwind client
- `ml/` — synthetic data generation, feature engineering, model training, evaluation
- `database/` — ERD docs, migration scripts, SQL schema
- `docs/` — product, architecture, security, API, AI methodology docs
- `tests/` — unit, API, authentication, authorization, and ML tests
- `scripts/` — setup scripts and utility operations

## Phase 1 status

This repository currently includes the planning and architectural foundation, plus a minimal runnable backend scaffold. The next step is requirement decomposition and incremental implementation by module.

## Quick start

### Backend

1. Go to `backend/`
2. Create a virtual environment
3. Install dependencies from `requirements.txt`
4. Run:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

The frontend application skeleton is prepared in `frontend/` and can be completed in subsequent phases.

## Documentation

See:

- `docs/architecture.md`
- `docs/phase-1-requirements-analysis.md`
- `database/erd.md`

## Important project rules

- No fake government APIs or official Rwanda datasets are used
- No secrets are committed to the repository
- Migrations are required for database changes
- AI output must be framed as risk indicators requiring review, not legal proof
- All major features are implemented in phases and validated before moving forward
