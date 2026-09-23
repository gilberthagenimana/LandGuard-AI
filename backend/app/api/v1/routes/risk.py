from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.risk import RiskAnalysisResponse
from app.services.auth.service import require_roles
from app.services.risk.service import RiskModelUnavailable, analyze_transaction

router = APIRouter(prefix="/risk-analysis", tags=["Risk Analysis"])


@router.post("/transactions/{transaction_id}", response_model=RiskAnalysisResponse)
def analyze_transaction_route(
    transaction_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("ADMIN", "VERIFICATION_OFFICER", "AUDITOR")),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    try:
        return analyze_transaction(db, transaction)
    except RiskModelUnavailable as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Risk model is not trained. Run the ML training command first.",
        ) from exc
