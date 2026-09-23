from pathlib import Path
import sys

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).parents[1] / "backend"))

from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.role import Role  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.auth.service import create_auth_token  # noqa: E402
from app.core.security import hash_password  # noqa: E402


engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def test_registration_requires_admin():
    client = TestClient(app)
    response = client.post(
        "/auth/register",
        json={"full_name": "Officer User", "email": "officer@example.com", "password": "Pass12345", "role": "VERIFICATION_OFFICER"},
    )
    assert response.status_code == 401


def test_admin_can_create_officer_with_role():
    db = SessionLocal()
    admin_role = Role(name="ADMIN", description="Administrator")
    officer_role = Role(name="VERIFICATION_OFFICER", description="Officer")
    admin = User(full_name="Admin", email="admin@example.com", password_hash=hash_password("AdminPass123"), is_active=True, roles=[admin_role])
    db.add_all([admin, officer_role])
    db.commit()
    db.refresh(admin)
    token = create_auth_token(admin)
    db.close()

    client = TestClient(app)
    response = client.post(
        "/users",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Officer User", "email": "officer@example.com", "password": "Pass12345", "role": "VERIFICATION_OFFICER"},
    )

    assert response.status_code == 200
    assert response.json()["roles"][0]["name"] == "VERIFICATION_OFFICER"
