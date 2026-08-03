from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models.transaction import Transaction
from app.ml.predictor import predict_next_month_expense, MINIMUM_MONTHS_REQUIRED
from app.schemas.prediction_schema import expense_prediction_schema

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def _get_monthly_expense_history(user_id):
    """
    Returns the user's expense totals, one per calendar month, in
    chronological order (oldest first) — exactly the shape our
    predictor module expects. Only months with actual expense
    transactions are included; we don't manufacture zero-months here,
    unlike Phase 9's dashboard trend (which deliberately fills gaps
    for a consistent chart). For prediction, a gap month usually just
    means missing data entry, not a genuine zero-spend month, so we
    exclude it rather than let it drag the trend line down artificially.
    """
    results = (
        db.session.query(
            func.strftime("%Y-%m", Transaction.date).label("period"),
            func.sum(Transaction.amount).label("total"),
        )
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .group_by("period")
        .order_by("period")
        .all()
    )

    return [float(total) for _, total in results]


@ai_bp.route("/predict-expense", methods=["GET"])
@jwt_required()
def predict_expense():
    """
    Returns a next-month expense prediction based on the user's
    historical monthly expense totals, using simple linear regression.
    """
    user_id = get_jwt_identity()

    monthly_totals = _get_monthly_expense_history(user_id)
    result = predict_next_month_expense(monthly_totals)
    result["minimum_months_required"] = MINIMUM_MONTHS_REQUIRED

    return jsonify(expense_prediction_schema.dump(result)), 200
