from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.verification import VerificationResponse
from app.services.auth.service import require_roles
from app.services.verification.service import verify_transaction

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.post("/transactions/{transaction_id}", response_model=VerificationResponse)
def verify_transaction_route(
    transaction_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles("ADMIN", "VERIFICATION_OFFICER", "AUDITOR")),
):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    results = verify_transaction(db, transaction)
    overall_status = "PASS" if all(result.status == "PASS" for result in results) else "REVIEW_REQUIRED"
    return VerificationResponse(
        transaction_id=transaction.id,
        overall_status=overall_status,
        verified_at=datetime.now(timezone.utc),
        results=results,
    )
