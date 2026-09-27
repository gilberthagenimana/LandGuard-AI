# LandGuard AI — Testing Strategy & Verification Guide

## 1. Testing Philosophy & Standards

In accordance with academic graduation standards, LandGuard AI mandates automated testing across all layers of the stack:
- **Backend Domain Rules**: Every verification rule is deterministically tested with synthetic fixtures.
- **Security & RBAC**: Positive and negative authorization paths are validated for all roles (`ADMIN`, `OFFICER`, `AUDITOR`).
- **AI/ML Pipeline**: Reproducibility, feature schema validation, model comparison, and prediction bounds are verified.
- **End-to-End Integration**: Complete lifecycle from transaction creation -> verification -> risk scoring -> case escalation is tested against in-memory SQLite instances.
- **Frontend Type Safety & Bundle Integrity**: Validated via strict TypeScript compilation (`tsc -b`) and Vite production bundling.

---

## 2. Test Suite Catalog

| Test File | Target Module | Description | Assertions & Checks |
| :--- | :--- | :--- | :--- |
| [`tests/test_admin_user_creation.py`](file:///d:/LandGuard%20AI/tests/test_admin_user_creation.py) | `auth`, `users`, RBAC | Validates that unauthenticated users cannot register; admins can create officers/auditors; officers cannot list user accounts (403). | Status codes 401, 200, 403; role assignments in responses. |
| [`tests/test_verification.py`](file:///d:/LandGuard%20AI/tests/test_verification.py) | `services/verification` | Validates all 9 verification rules: parcel existence, seller match, authorizations, conflicting buyers, recent transfers (<30d), and frequency. | Validates all 9 rules return `PASS` for clean transactions and appropriate `FAIL`/`WARNING` flags for suspicious records. |
| [`tests/test_risk_service.py`](file:///d:/LandGuard%20AI/tests/test_risk_service.py) | `services/risk` | Validates end-to-end AI risk analysis service on a live transaction. | Risk score range [0, 100], risk level classification (`LOW`, `MEDIUM`, `HIGH`), explainability indicators present. |
| [`tests/test_ml_pipeline.py`](file:///d:/LandGuard%20AI/tests/test_ml_pipeline.py) | `ml/` | Validates synthetic dataset generation reproducibility, model training, evaluation metrics generation, and input error handling. | Seed reproducibility, multi-class presence, candidate model selection, missing feature exception handling. |
| [`tests/test_integration_flow.py`](file:///d:/LandGuard%20AI/tests/test_integration_flow.py) | Full API Pipeline | Executes full sequence: parcel setup -> ownership transfer -> transaction creation -> rule verification -> audit log access restriction. | Transaction creation (201), verification execution (200), auditor access enforcement (403). |

---

## 3. Running Automated Tests

### 3.1. Backend Tests (Pytest)
Run the full test suite using the project's virtual environment:
```powershell
.\.venv\Scripts\pytest.exe
```

Verbose mode with per-test reporting:
```powershell
.\.venv\Scripts\pytest.exe -v
```

Running a specific test module:
```powershell
.\.venv\Scripts\pytest.exe tests/test_verification.py -v
```

### 3.2. Machine Learning Pipeline Execution
Generate synthetic academic training dataset (1,200 rows):
```powershell
.\.venv\Scripts\python.exe -m ml.scripts.generate_dataset --output ml/data/synthetic_land_transactions.csv --rows 1200
```

Train and evaluate candidate models (Logistic Regression, Decision Tree, Random Forest):
```powershell
.\.venv\Scripts\python.exe -m ml.training.train --dataset ml/data/synthetic_land_transactions.csv --model-dir ml/models
```

### 3.3. Frontend Build & Typecheck
Verify TypeScript compilation and Vite build:
```powershell
cd frontend
npm run build
```

---

## 4. Test Isolation Architecture

Tests use `sqlite:///:memory:` with SQLAlchemy's `StaticPool` to ensure complete isolation from production and local developer databases.

FastAPI dependency overrides (`app.dependency_overrides[get_db]`) are managed via autouse pytest fixtures:
```python
@pytest.fixture(autouse=True)
def setup_db():
  Base.metadata.create_all(bind=engine)
  app.dependency_overrides[get_db] = override_get_db
  yield
  app.dependency_overrides.pop(get_db, None)
```
This guarantees that test databases never leak state between test files or parallel test runners.
