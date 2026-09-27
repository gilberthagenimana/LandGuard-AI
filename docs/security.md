# LandGuard AI — Security Architecture & Threat Model

## 1. Executive Security Overview

LandGuard AI is designed as a secure institutional decision-support system for verifying land transactions and assessing transaction fraud risks. Because real-world land administration involves sensitive personal data, ownership claims, and high economic valuations, security, privacy, and authorization integrity are first-class architectural concerns.

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Attack Scenario | Architectural Safeguard |
| :--- | :--- | :--- |
| **Credential Stuffing & Brute Force** | Automated dictionary attacks against `/api/auth/login`. | Rate limiting via `slowapi` (`Limiter`), constant-time password hash verification with bcrypt / Argon2, lockout alerts. |
| **Privilege Escalation** | Officer or Auditor attempting to create administrative users or tamper with system roles. | Enforced FastAPI dependency `require_roles("ADMIN")` on all user-mutation endpoints; role extracted from verified JWT claims. |
| **SQL Injection** | SQL payloads submitted in search filters, parcel codes, or form fields. | SQLAlchemy ORM using parameterized query generation throughout; zero raw SQL string concatenation. |
| **Tampering with Audit Records** | Malicious insider attempting to erase record of an unauthorized transaction approval. | Audit logs are append-only; no `DELETE` or `PUT` endpoints exist for `/api/audit-logs`. |
| **Sensitive Data Exposure** | Exposure of password hashes or API tokens in API responses or logs. | Strict Pydantic response models (`UserOut`) explicitly exclude `password_hash`; logs record actions and IDs, never passwords or JWT secrets. |
| **CSRF / Cross-Origin Hijacking** | Malicious web page making unauthorized API calls on behalf of an authenticated user. | Bearer token authorization in `Authorization: Bearer <token>` header rather than ambient cookies; CORS whitelist restricted to trusted origins. |

---

## 3. Authentication Architecture

1. **Endpoint**: `POST /api/auth/login` accepts `email` or `username` along with `password` and optional requested `role`.
2. **Password Verification**: Validates passwords using `passlib.context.CryptContext` configured with `bcrypt` and `argon2`.
3. **JSON Web Tokens (JWT)**:
   - Signed using HMAC SHA-256 (`HS256`).
   - Configurable secret key via `JWT_SECRET_KEY` environment variable.
   - Standard payload:
     - `sub`: User ID (subject).
     - `exp`: Expiration timestamp (default: 60 minutes).
     - `role`: Primary authorized user role.
4. **Current User Dependency**:
   - `get_current_user` extracts and decodes the Bearer token from the `Authorization` header, verifies expiration and signature, confirms account is active in the database, and returns the authenticated user object.

---

## 4. Role-Based Access Control (RBAC) Matrix

The system implements three mutually distinct institutional roles:

| Module / Endpoint | Action | ADMIN | OFFICER | AUDITOR |
| :--- | :--- | :---: | :---: | :---: |
| `/api/auth/login` | Sign in | Yes | Yes | Yes |
| `/api/auth/me` | View own profile | Yes | Yes | Yes |
| `/api/users` (GET) | List all users | **Yes** | No (403) | No (403) |
| `/api/users` (POST) | Create officer/auditor account | **Yes** | No (403) | No (403) |
| `/api/users/{id}` (PUT/DELETE) | Modify or revoke account access | **Yes** | No (403) | No (403) |
| `/api/dashboard/stats` | View institutional metrics | Yes | Yes | Yes |
| `/api/parcels` (GET) | Search & view parcels | Yes | Yes | Yes |
| `/api/parcels` (POST/PUT) | Create / update parcel | Yes | Yes | No (403) |
| `/api/parcels/{id}/history` | View title transfer history | Yes | Yes | Yes |
| `/api/owners` (GET) | Search & view owners | Yes | Yes | Yes |
| `/api/owners` (POST/PUT) | Create / update owner | Yes | Yes | No (403) |
| `/api/transactions` (GET) | Search & view transactions | Yes | Yes | Yes |
| `/api/transactions` (POST) | Submit new transaction | Yes | Yes | No (403) |
| `/api/verification` (POST) | Execute 9 verification rules | Yes | Yes | No (403) |
| `/api/risk-analysis` (POST) | Execute AI risk scoring | Yes | Yes | No (403) |
| `/api/cases` (GET) | View suspicious review cases | Yes | Yes | Yes |
| `/api/cases/{id}` (PUT) | Update status & add review notes | Yes | Yes | No (403) |
| `/api/audit-logs` (GET) | View immutable activity log | **Yes** | No (403) | **Yes** |
| `/api/reports/*` | View & export reports | Yes | Yes | Yes |

---

## 5. Audit Logging Architecture

Every critical business mutation generates an immutable record in `audit_logs`:
- **Captured Data**:
  - `user_id`: Acting operator ID.
  - `action`: Standardized event code (e.g., `USER_CREATED`, `TRANSACTION_VERIFICATION`, `AI_RISK_ANALYSIS`, `CASE_REVIEWED`, `OWNERSHIP_UPDATED`).
  - `entity` & `entity_id`: Domain target (e.g. `Transaction` `TX-98231`).
  - `metadata`: JSON payload containing context (e.g. status transition, risk level).
  - `timestamp`: UTC datetime.
- **Redaction Rules**:
  - Passwords and plain authorization tokens are strictly excluded from logging.

---

## 6. Institutional AI Decision-Support Boundaries

To uphold ethical, legal, and institutional standards for Rwanda:
1. **Advisory Risk Indicator Only**:
   - The AI component produces a probability-calibrated **risk score (0–100)** and categorical **risk level** (`LOW`, `MEDIUM`, `HIGH`).
   - It does **not** make legal determinations of fraud, criminal guilt, or land title validity.
2. **Mandatory Human-in-the-Loop Review**:
   - Elevated risk scores automatically open a review case in `case_reviews` with status `UNDER_REVIEW`.
   - The final adjudication requires an authorized verification officer to inspect supporting physical documents and official registry systems.
3. **Synthetic Data Transparency**:
   - Demo records and training sets are explicitly labeled as synthetic academic prototypes to avoid misrepresentation of official Rwandan land records.
