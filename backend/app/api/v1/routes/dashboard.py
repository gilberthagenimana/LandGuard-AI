from fastapi import APIRouter, Depends

from app.models.user import User
from app.services.auth.service import get_current_user, require_roles

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(current_user: User = Depends(require_roles("ADMIN", "VERIFICATION_OFFICER", "AUDITOR"))):
    return {
        "total_parcels": 0,
        "total_owners": 0,
        "total_transactions": 0,
        "transactions_under_review": 0,
        "low_risk_transactions": 0,
        "medium_risk_transactions": 0,
        "high_risk_transactions": 0,
        "recent_verification_activity": [],
        "recent_alerts": [],
    }
