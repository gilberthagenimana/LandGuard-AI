from app.db.base import Base
from app.db.session import engine
from app.models.role import Role


def init_db() -> None:
    import app.models.user  # noqa: F401
    import app.models.role  # noqa: F401
    import app.models.parcel  # noqa: F401
    import app.models.owner  # noqa: F401
    import app.models.ownership_history  # noqa: F401
    import app.models.transaction  # noqa: F401
    import app.models.audit_log  # noqa: F401
    import app.models.case_review  # noqa: F401

    Base.metadata.create_all(bind=engine)

    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        default_roles = {
            "ADMIN": "Full system administration access.",
            "VERIFICATION_OFFICER": "Can verify transactions and manage review cases.",
            "AUDITOR": "Read-only access to verification data and audit records.",
        }
        for name, description in default_roles.items():
            if db.query(Role).filter(Role.name == name).first() is None:
                db.add(Role(name=name, description=description))
        db.commit()
    finally:
        db.close()
