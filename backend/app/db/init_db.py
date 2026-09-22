from app.db.base import Base
from app.db.session import engine


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
