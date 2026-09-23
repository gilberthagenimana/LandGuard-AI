from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.case_review import CaseReview
from app.models.owner import Owner
from app.models.parcel import Parcel
from app.models.transaction import Transaction
from app.models.user import User
from app.services.auth.service import get_current_user, require_roles

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("ADMIN", "VERIFICATION_OFFICER", "AUDITOR")),
):
    activity = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_parcels": db.query(func.count(Parcel.id)).scalar() or 0,
        "total_owners": db.query(func.count(Owner.id)).scalar() or 0,
        "total_transactions": db.query(func.count(Transaction.id)).scalar() or 0,
        "transactions_under_review": db.query(func.count(CaseReview.id))
        .filter(CaseReview.status.in_(("OPEN", "IN_REVIEW")))
        .scalar()
        or 0,
        # Risk analysis is not persisted yet, so do not present invented scores.
        "low_risk_transactions": 0,
        "medium_risk_transactions": 0,
        "high_risk_transactions": 0,
        "recent_verification_activity": [
            {
                "action": item.action,
                "entity": item.entity,
                "entity_id": item.entity_id,
                "created_at": item.created_at.isoformat(),
            }
            for item in activity
        ],
        "recent_alerts": [],
    }
