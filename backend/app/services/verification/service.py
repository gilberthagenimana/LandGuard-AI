from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.owner import Owner
from app.models.ownership_history import OwnershipHistory
from app.models.parcel import Parcel
from app.models.transaction import Transaction
from app.schemas.verification import VerificationResult


def verify_transaction(db: Session, transaction: Transaction) -> list[VerificationResult]:
    results: list[VerificationResult] = []
    parcel = db.query(Parcel).filter(Parcel.id == transaction.parcel_id).first()
    seller = (
        db.query(Owner)
        .filter(Owner.id == transaction.seller_owner_id)
        .first()
        if transaction.seller_owner_id
        else None
    )

    results.append(
        VerificationResult(
            rule_name="Parcel exists",
            status="PASS" if parcel else "FAIL",
            severity="LOW" if parcel else "HIGH",
            explanation=(
                "The transaction references an existing parcel."
                if parcel
                else "The transaction references a parcel that is not present in the available records."
            ),
        )
    )

    current_owner_id = None
    if parcel:
        latest_history = (
            db.query(OwnershipHistory)
            .filter(OwnershipHistory.parcel_id == parcel.id)
            .order_by(OwnershipHistory.transfer_date.desc())
            .first()
        )
        current_owner_id = latest_history.new_owner_id if latest_history else None

    seller_matches = bool(seller and current_owner_id and seller.id == current_owner_id)
    results.append(
        VerificationResult(
            rule_name="Seller ownership match",
            status="PASS" if seller_matches else "WARNING",
            severity="LOW" if seller_matches else "HIGH",
            explanation=(
                "The seller matches the latest recorded owner."
                if seller_matches
                else "The seller could not be matched to the latest recorded owner in the available records."
            ),
        )
    )

    active_conflict = (
        db.query(Transaction)
        .filter(
            Transaction.parcel_id == transaction.parcel_id,
            Transaction.id != transaction.id,
            Transaction.status.in_(("PENDING", "UNDER_REVIEW", "ACTIVE")),
        )
        .first()
    )
    results.append(
        VerificationResult(
            rule_name="Duplicate or conflicting active transaction",
            status="FAIL" if active_conflict else "PASS",
            severity="HIGH" if active_conflict else "LOW",
            explanation=(
                "Another active transaction exists for this parcel and requires review."
                if active_conflict
                else "No other active transaction was found for this parcel."
            ),
        )
    )

    recent_cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=30)
    recent_change = (
        db.query(OwnershipHistory)
        .filter(
            OwnershipHistory.parcel_id == transaction.parcel_id,
            OwnershipHistory.transfer_date >= recent_cutoff,
        )
        .first()
    )
    results.append(
        VerificationResult(
            rule_name="Recent ownership change",
            status="WARNING" if recent_change else "PASS",
            severity="MEDIUM" if recent_change else "LOW",
            explanation=(
                "Ownership changed within the last 30 days; additional verification is recommended."
                if recent_change
                else "No ownership change was recorded within the last 30 days."
            ),
        )
    )

    required_fields_present = bool(
        transaction.parcel_id
        and transaction.transaction_type
        and transaction.status
        and transaction.transaction_date
    )
    results.append(
        VerificationResult(
            rule_name="Required transaction fields",
            status="PASS" if required_fields_present else "FAIL",
            severity="LOW" if required_fields_present else "MEDIUM",
            explanation=(
                "Required transaction fields are present."
                if required_fields_present
                else "One or more required transaction fields are missing."
            ),
        )
    )

    return results
