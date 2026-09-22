# Phase 1: Requirements Analysis and Architecture Direction

## Requirements summary

The project aims to create a decision-support system for verifying land transactions in Rwanda while avoiding legal claims. It combines rule-based verification checks with an AI fraud-risk model, human review workflows, and audit logging.

## Ambiguities identified and decisions

### 1. Official data source
The specification states that real government data is unavailable and forbids inventing official datasets. The project therefore uses clearly labeled synthetic data for development and testing.

### 2. Legal status of AI output
AI output must never be treated as legal proof. The architecture therefore separates:
- verification rules
- AI risk estimation
- human review by authorized officers

### 3. Duplicate transactions
The project requires duplicate detection without assuming fraud. Accordingly, the verification engine will flag duplicates as risk indicators and mark them as needs-review rather than confirming fraud.

### 4. Role model
The user roles are clearly defined and should be enforced via dependency-based authorization checks in the backend. Auditors are intentionally read-only unless explicit write permissions are granted.

### 5. Dataset issue
Because a real-world fraud dataset is not provided, the design includes a synthetic data generation process and a clearly documented dataset disclaimer.

## Architectural decisions

### Decision 1: Separate rule engine from ML engine
This allows explainability. The rule engine produces precise checks with statuses and explanations, while the ML engine assesses overall transaction risk using risk features derived from the same data.

### Decision 2: Use a layered backend
A layered structure keeps the API, business services, database models, and ML logic distinct. This supports modular development and prevents one module from doing too much.

### Decision 3: Keep human review central
The project is a verification system, not an autonomous fraud detector. Case review is mandatory for flagged transactions.

### Decision 4: Use audit-first design
All significant actions are logged from the start. This supports accountability, security review, and academic project evaluation.

## Proposed implementation order

1. Create backend foundation and config
2. Define models and migrations
3. Implement users, auth, and RBAC
4. Implement parcels and owners
5. Add ownership history and transactions
6. Implement verification rules and duplicate checks
7. Generate synthetic dataset and train baseline models
8. Add AI risk prediction API
9. Build frontend dashboard and management pages
10. Integrate case reviews and audit logs
11. Validate with tests and security review

## Risk areas to monitor

- poor feature quality in synthetic data
- class imbalance and overfitting in ML models
- complexity in ownership history logic
- permission enforcement mistakes
- inconsistent naming across modules

## Phase 1 output

The repository now includes the architecture and initial scaffolding needed to continue into Phase 2 and later implementation modules.
