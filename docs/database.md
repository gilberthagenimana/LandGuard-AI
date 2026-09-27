# LandGuard AI — Database Architecture & Specification

## 1. Executive Summary & Design Principles

The LandGuard AI database is designed as a normalized, relational system engineered to track land parcel registration, legal ownership lineage, transactional lifecycles, rule-based verification outcomes, machine-learning risk predictions, officer case reviews, and immutable audit trails.

The design adheres to the following core principles:
1. **Third Normal Form (3NF)**: Prevents data redundancy and anomalies in ownership, transaction, and party data.
2. **Temporal Ownership Tracking**: Separates current parcel ownership from historical conveyances via `ownership_history` to support auditability.
3. **Decoupled Verification & Risk Predictions**: Rule-based verification records and AI prediction records are stored independently to maintain evidence integrity and explainability.
4. **Append-Only Auditing**: Security and business events are logged in `audit_logs` without storing raw user credentials.
5. **Portability**: Compatible with PostgreSQL in staging/production (`postgresql+psycopg2://...`) and SQLite (`sqlite:///./landguard_ai.db`) for zero-dependency local development and academic evaluation.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : assigned
    ROLES ||--o{ USER_ROLES : defines
    USERS ||--o{ TRANSACTIONS : creates
    USERS ||--o{ CASE_REVIEWS : reviews
    USERS ||--o{ AUDIT_LOGS : executes

    PARCELS ||--o{ OWNERSHIP_HISTORY : tracks
    PARCELS ||--o{ TRANSACTIONS : subject_of
    PARCELS ||--o{ CASE_REVIEWS : flagged_in

    OWNERS ||--o{ OWNERSHIP_HISTORY : previous_or_new
    OWNERS ||--o{ TRANSACTIONS : seller_or_buyer

    TRANSACTIONS ||--o{ VERIFICATION_RESULTS : evaluated_by
    TRANSACTIONS ||--o{ RISK_PREDICTIONS : scored_by
    TRANSACTIONS ||--o| CASE_REVIEWS : escalates_to

    USERS {
        int id PK
        string username UK
        string email UK
        string full_name
        string password_hash
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ROLES {
        int id PK
        string name UK
        string description
    }

    USER_ROLES {
        int user_id PK,FK
        int role_id PK,FK
    }

    OWNERS {
        int id PK
        string owner_code UK
        string full_name
        string identification_number
        string phone
        string email
        string status
        datetime created_at
        datetime updated_at
    }

    PARCELS {
        int id PK
        string parcel_code UK
        string location
        string province
        string district
        string sector
        string cell
        string village
        float area_ha
        string status
        string registration_reference
        datetime created_at
        datetime updated_at
    }

    OWNERSHIP_HISTORY {
        int id PK
        int parcel_id FK
        int previous_owner_id FK
        int new_owner_id FK
        datetime transfer_date
        string reason_type
        string supporting_reference
        datetime created_at
    }

    TRANSACTIONS {
        int id PK
        string transaction_code UK
        int parcel_id FK
        int seller_owner_id FK
        int buyer_owner_id FK
        string transaction_type
        datetime transaction_date
        decimal declared_value
        string status
        int created_by FK
        datetime created_at
        datetime updated_at
    }

    VERIFICATION_RESULTS {
        int id PK
        int transaction_id FK
        string rule_name
        string result
        string severity
        text explanation
        datetime created_at
    }

    RISK_PREDICTIONS {
        int id PK
        int transaction_id FK
        int risk_score
        string risk_level
        string model_version
        text explanation
        json indicators
        datetime created_at
    }

    CASE_REVIEWS {
        int id PK
        string case_code UK
        int transaction_id FK
        int parcel_id FK
        int assigned_to FK
        string status
        text review_notes
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string entity
        string entity_id
        text details
        json metadata
        datetime created_at
    }
```

---

## 3. Data Dictionary & Table Specifications

### 3.1. `users`
Stores authenticated users of the system (administrators, verification officers, and auditors).
- `id` (INTEGER, PK, autoincrement): Internal system identifier.
- `username` (VARCHAR(100), UNIQUE, INDEX, NOT NULL): Login username.
- `email` (VARCHAR(255), UNIQUE, INDEX, NOT NULL): Contact email address.
- `full_name` (VARCHAR(255), NOT NULL): Official personnel name.
- `password_hash` (VARCHAR(255), NOT NULL): Secure Argon2/bcrypt hash.
- `is_active` (BOOLEAN, DEFAULT TRUE): Account status flag.
- `created_at` (DATETIME, NOT NULL): Account creation timestamp.
- `updated_at` (DATETIME, NOT NULL): Last profile modification.

### 3.2. `roles` & `user_roles`
Implements normalized Role-Based Access Control (RBAC).
- `roles.name`: `ADMIN`, `OFFICER`, `AUDITOR`.
- `user_roles`: Composite PK (`user_id`, `role_id`) joining users to authorized roles.

### 3.3. `parcels`
Represents physical land parcels within the Rwandan administrative hierarchy.
- `id` (INTEGER, PK, autoincrement): Internal identifier.
- `parcel_code` (VARCHAR(64), UNIQUE, INDEX, NOT NULL): Unique cadastral reference (e.g. `RW-10432`).
- `location` (VARCHAR(255), NOT NULL): Textual summary of location.
- `province`, `district`, `sector`, `cell`, `village`: Rwandan administrative division fields.
- `area_ha` (FLOAT, NOT NULL): Surface area in hectares.
- `status` (VARCHAR(32), INDEX, NOT NULL): `ACTIVE`, `UNDER_REVIEW`, `DISPUTED`.
- `registration_reference` (VARCHAR(128)): Official registration reference ID.

### 3.4. `owners`
Represents individuals or corporate entities who hold legal title to land.
- `id` (INTEGER, PK, autoincrement): Internal identifier.
- `owner_code` (VARCHAR(64), UNIQUE, INDEX, NOT NULL): System owner code (e.g. `O-2291`).
- `full_name` (VARCHAR(255), NOT NULL): Name of registered owner.
- `identification_number` (VARCHAR(64)): National ID / passport / company registration number.
- `phone`, `email`: Contact details.
- `status` (VARCHAR(32), INDEX, NOT NULL): `ACTIVE`, `INACTIVE`.

### 3.5. `ownership_history`
Maintains complete chronological title transfer history for every parcel.
- `parcel_id` (INTEGER, FK -> parcels.id, INDEX).
- `previous_owner_id` (INTEGER, FK -> owners.id, NULLABLE for initial registration).
- `new_owner_id` (INTEGER, FK -> owners.id, NOT NULL).
- `transfer_date` (DATETIME, INDEX, NOT NULL): Effective date of title deed transfer.
- `reason_type` (VARCHAR(64)): `FIRST_REGISTRATION`, `SALE`, `INHERITANCE`, `CORRECTION`, `EXCHANGE`.
- `supporting_reference` (VARCHAR(255)): Reference to legal documentation.

### 3.6. `transactions`
Conveyance transactions submitted for verification and registration.
- `transaction_code` (VARCHAR(64), UNIQUE, INDEX, NOT NULL): System code (e.g. `TX-98231`).
- `parcel_id` (INTEGER, FK -> parcels.id, INDEX, NOT NULL).
- `seller_owner_id` (INTEGER, FK -> owners.id, NULLABLE).
- `buyer_owner_id` (INTEGER, FK -> owners.id, NULLABLE).
- `transaction_type` (VARCHAR(32), NOT NULL): `SALE`, `TRANSFER`, `INHERITANCE`.
- `transaction_date` (DATETIME, INDEX, NOT NULL).
- `declared_value` (NUMERIC(14,2), NOT NULL): Valuation in Rwandan Francs (RWF).
- `status` (VARCHAR(32), INDEX, NOT NULL): `PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`.
- `created_by` (INTEGER, FK -> users.id).

### 3.7. `verification_results`
Deterministic evaluation of business rules.
- `transaction_id` (INTEGER, FK -> transactions.id, INDEX, NOT NULL).
- `rule_name` (VARCHAR(128), NOT NULL).
- `result` (VARCHAR(16), NOT NULL): `PASS`, `FAIL`, `WARNING`.
- `severity` (VARCHAR(16), NOT NULL): `LOW`, `MEDIUM`, `HIGH`.
- `explanation` (TEXT, NOT NULL).

### 3.8. `risk_predictions`
Outputs from the machine learning fraud risk scoring engine.
- `transaction_id` (INTEGER, FK -> transactions.id, INDEX, NOT NULL).
- `risk_score` (INTEGER, NOT NULL): 0 to 100.
- `risk_level` (VARCHAR(16), INDEX, NOT NULL): `LOW`, `MEDIUM`, `HIGH`.
- `model_version` (VARCHAR(64), NOT NULL): Champion model identifier (e.g. `random_forest-v1-synthetic`).
- `explanation` (TEXT, NOT NULL).
- `indicators` (JSON): Structured array of flagged risk indicators.

### 3.9. `case_reviews`
Workflow records for transactions requiring human officer verification.
- `case_code` (VARCHAR(64), UNIQUE, INDEX, NOT NULL): e.g. `CASE-0441`.
- `transaction_id` (INTEGER, FK -> transactions.id, INDEX, NOT NULL).
- `parcel_id` (INTEGER, FK -> parcels.id, INDEX, NOT NULL).
- `assigned_to` (INTEGER, FK -> users.id, NULLABLE).
- `status` (VARCHAR(32), INDEX, NOT NULL): `OPEN`, `UNDER_REVIEW`, `NEEDS_INFORMATION`, `RESOLVED`, `CLOSED`.
- `review_notes` (TEXT, NULLABLE).

### 3.10. `audit_logs`
Immutable system audit log.
- `user_id` (INTEGER, FK -> users.id, INDEX, NULLABLE for system actions).
- `action` (VARCHAR(64), INDEX, NOT NULL): e.g. `LOGIN`, `TRANSACTION_VERIFICATION`, `CASE_REVIEWED`.
- `entity` (VARCHAR(64), INDEX, NOT NULL): e.g. `Transaction`, `Parcel`, `Case`.
- `entity_id` (VARCHAR(64), NULLABLE).
- `details` (TEXT, NULLABLE).
- `metadata` (JSON, NULLABLE).
- `created_at` (DATETIME, NOT NULL).

---

## 4. Database Migrations & Setup Instructions

### 4.1. Local Development (SQLite)
By default, the application runs against `sqlite:///./landguard_ai.db`.

To apply all migrations:
```powershell
.\.venv\Scripts\alembic.exe upgrade head
```

To create a new migration after modifying models:
```powershell
.\.venv\Scripts\alembic.exe revision --autogenerate -m "description_of_change"
```

### 4.2. PostgreSQL Configuration
To point to an external PostgreSQL instance:
1. Copy `.env.example` to `.env`:
   ```ini
   DATABASE_URL=postgresql+psycopg2://landuser:landpass@localhost:5432/land_verification
   ```
2. Run migrations:
   ```powershell
   .\.venv\Scripts\alembic.exe upgrade head
   ```
3. Initialize default roles and seeded demo records:
   ```powershell
   .\.venv\Scripts\python.exe -c "from app.db.init_db import init_db; init_db()"
   ```
