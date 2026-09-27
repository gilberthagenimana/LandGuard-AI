# LandGuard AI — REST API Specification

The LandGuard AI backend is built with FastAPI. Interactive OpenAPI documentation is served automatically at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

All endpoints are versioned under `/api/` and require JSON payloads and Bearer token authentication unless designated public.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates an authorized user and issues a signed JWT access token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "officer@landguard.local",
    "password": "OfficerPass123!",
    "role": "OFFICER"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "expires_in": 3600
  }
  ```

### `GET /api/auth/me`
Returns profile information and assigned roles for the authenticated user.
- **Access**: Authenticated (`ADMIN`, `OFFICER`, `AUDITOR`)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "id": 2,
    "username": "officer",
    "email": "officer@landguard.local",
    "full_name": "Marie Habyarimana",
    "is_active": true,
    "roles": ["OFFICER"]
  }
  ```

---

## 2. User Management Endpoints (Admin Only)

### `GET /api/users`
Lists all user accounts.
- **Access**: `ADMIN` only

### `POST /api/users`
Creates a new officer or auditor account.
- **Access**: `ADMIN` only
- **Request Body**:
  ```json
  {
    "username": "new_officer",
    "full_name": "Diane Uwimana",
    "email": "d.uwimana@landguard.local",
    "password": "SecurePassword123!",
    "role": "OFFICER",
    "is_active": true
  }
  ```

### `DELETE /api/users/{user_id}`
Deactivates a user's access without deleting past audit history.
- **Access**: `ADMIN` only
- **Response `204 No Content`**

---

## 3. Parcel Management Endpoints

### `GET /api/parcels`
Lists and searches registered land parcels.
- **Query Params**: `q` (search string filtering code, location, district)
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 1,
      "parcel_code": "RW-10432",
      "location": "Kicukiro / Niboye / Kagarama",
      "province": "Kigali",
      "district": "Kicukiro",
      "sector": "Niboye",
      "cell": "Kagarama",
      "village": "Demo Village A",
      "area_ha": 0.082,
      "status": "ACTIVE",
      "current_owner_name": "Jean Mugisha",
      "current_owner_id": 1
    }
  ]
  ```

### `GET /api/parcels/{parcel_id}/ownership-history`
Returns chronological title deeds and transfer records for a parcel.
- **Response `200 OK`**: Array of history records containing transfer date, previous owner, new owner, reason, and reference.

### `GET /api/parcels/{parcel_id}/transactions`
Lists all historical and active transactions submitted for the parcel.

---

## 4. Owner Management Endpoints

### `GET /api/owners`
Search owners by name or owner code.
- **Query Params**: `q`

### `POST /api/owners`
Registers a new land owner in available system records.
- **Access**: `ADMIN`, `OFFICER`

---

## 5. Transaction Management Endpoints

### `GET /api/transactions`
Lists transactions with optional search query.

### `POST /api/transactions`
Registers a new conveyance transaction.
- **Request Body**:
  ```json
  {
    "parcel_id": 1,
    "seller_owner_id": 1,
    "buyer_owner_id": 2,
    "transaction_type": "SALE",
    "transaction_date": "2026-09-26T12:00:00Z",
    "declared_value": "18500000.00",
    "status": "PENDING"
  }
  ```

---

## 6. Verification Engine Endpoint

### `POST /api/verification/transactions/{transaction_id}`
Executes the 9 rule-based verification checks against current database records.
- **Access**: `ADMIN`, `OFFICER`
- **Response `200 OK`**:
  ```json
  {
    "transaction_id": 1,
    "overall_status": "REVIEW_REQUIRED",
    "verified_at": "2026-09-26T18:14:00Z",
    "results": [
      {
        "rule_name": "Parcel exists",
        "status": "PASS",
        "severity": "LOW",
        "explanation": "The transaction references an existing parcel in the available records."
      },
      {
        "rule_name": "Seller ownership match",
        "status": "FAIL",
        "severity": "HIGH",
        "explanation": "The seller does not match the registered owner in the available system records."
      },
      {
        "rule_name": "Recent ownership change",
        "status": "WARNING",
        "severity": "MEDIUM",
        "explanation": "WARNING: Recent ownership change detected. This is a risk indicator, not proof of fraud."
      }
    ]
  }
  ```

---

## 7. AI Fraud Risk Analysis Endpoint

### `POST /api/risk-analysis/transactions/{transaction_id}`
Computes a machine-learning risk prediction using engineered features from transaction and parcel history.
- **Access**: `ADMIN`, `OFFICER`
- **Response `200 OK`**:
  ```json
  {
    "transaction_id": 1,
    "risk_score": 82,
    "risk_level": "HIGH",
    "model_version": "random_forest-v1-synthetic",
    "reasons": [
      "Seller does not match the latest recorded owner.",
      "Possible duplicate or conflicting transaction detected.",
      "Recent ownership change detected."
    ],
    "analyzed_at": "2026-09-26T18:14:00Z"
  }
  ```

---

## 8. Case Review Workflow Endpoints

### `GET /api/cases`
Lists open and resolved review cases.
- **Query Params**: `status` (`OPEN`, `UNDER_REVIEW`, `NEEDS_INFORMATION`, `RESOLVED`, `CLOSED`)

### `GET /api/cases/{case_id}`
Returns complete 360-degree case review bundle:
- Case metadata and review status
- Transaction details (parties, valuation)
- Linked parcel details
- Full chronological ownership history
- Verification rule outcomes
- AI risk score and explainable reasons
- Disclaimer notice

### `PUT /api/cases/{case_id}`
Updates case status, assigns an officer, and appends review notes.
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "review_notes": "Official registry deed verified at sector office. Discrepancy explained by court succession order."
  }
  ```

---

## 9. Audit & Reporting Endpoints

### `GET /api/audit-logs`
Returns immutable system activity trail with search filtering.
- **Access**: `ADMIN`, `AUDITOR`

### `GET /api/reports/verification`
Comprehensive summary report of transaction verification executions.

### `GET /api/reports/risk`
Summary of all AI risk evaluations and high-risk clusters.

### `GET /api/reports/cases`
Summary of open, under-review, and closed investigation cases.

### `GET /api/reports/audit`
Audit compliance activity report.

### `GET /api/reports/parcels/{parcel_id}/history`
Official audit report for a specific parcel's entire conveyance lineage.
