from datetime import date, datetime, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.budget import Budget
from app.ml.predictor import predict_next_month_expense, MINIMUM_MONTHS_REQUIRED
from app.ml.advisor import generate_insights
from app.schemas.prediction_schema import expense_prediction_schema
from app.schemas.insight_schema import insights_response_schema

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def _get_monthly_expense_history(user_id):
    """
    Returns the user's expense totals, one per calendar month, in
    chronological order.
    """
    results = (
        db.session.query(
            func.to_char(Transaction.date, "YYYY-MM").label("period"),
            func.sum(Transaction.amount).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
        )
        .group_by("period")
        .order_by("period")
        .all()
    )

    return [float(total) for _, total in results]


@ai_bp.route("/predict-expense", methods=["GET"])
@jwt_required()
def predict_expense():
    """
    Predicts the user's next month's expenses using historical data.
    """
    user_id = get_jwt_identity()

    monthly_totals = _get_monthly_expense_history(user_id)

    result = predict_next_month_expense(monthly_totals)
    result["minimum_months_required"] = MINIMUM_MONTHS_REQUIRED

    return jsonify(expense_prediction_schema.dump(result)), 200


def _get_current_budgets_with_progress(user_id, month, year):
    """
    Returns all budgets for the current month along with spending progress.
    """
    budgets = Budget.query.filter_by(
        user_id=user_id,
        month=month,
        year=year,
    ).all()

    results = []

    for b in budgets:
        spent = (
            db.session.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == user_id,
                Transaction.category_id == b.category_id,
                Transaction.type == "expense",
                func.to_char(Transaction.date, "MM") == f"{month:02d}",
                func.to_char(Transaction.date, "YYYY") == str(year),
            )
            .scalar()
        ) or 0

        category = Category.query.get(b.category_id)

        limit_amount = float(b.limit_amount)
        spent = float(spent)

        percent_used = (
            round((spent / limit_amount) * 100, 1)
            if limit_amount
            else 0
        )

        results.append(
            {
                "category_name": category.name if category else "Unknown",
                "limit_amount": limit_amount,
                "spent": spent,
                "percent_used": percent_used,
            }
        )

    return results


def _get_category_month_changes(user_id, month, year, prev_month, prev_year):
    """
    Compares category spending between the current and previous month.
    """

    def totals_by_category(m, y):
        rows = (
            db.session.query(
                Category.name,
                func.sum(Transaction.amount),
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                func.to_char(Transaction.date, "MM") == f"{m:02d}",
                func.to_char(Transaction.date, "YYYY") == str(y),
            )
            .group_by(Category.name)
            .all()
        )

        return {
            name: float(total or 0)
            for name, total in rows
        }

    current = totals_by_category(month, year)
    previous = totals_by_category(prev_month, prev_year)

    all_names = set(current.keys()) | set(previous.keys())

    return [
        {
            "category_name": name,
            "current": current.get(name, 0),
            "previous": previous.get(name, 0),
        }
        for name in all_names
    ]


@ai_bp.route("/insights", methods=["GET"])
@jwt_required()
def get_insights():
    """
    Generates rule-based financial insights.
    """
    user_id = get_jwt_identity()

    today = date.today()
    month = today.month
    year = today.year

    if month == 1:
        prev_month = 12
        prev_year = year - 1
    else:
        prev_month = month - 1
        prev_year = year

    budgets = _get_current_budgets_with_progress(
        user_id,
        month,
        year,
    )

    category_changes = _get_category_month_changes(
        user_id,
        month,
        year,
        prev_month,
        prev_year,
    )

    totals = (
        db.session.query(
            Transaction.type,
            func.sum(Transaction.amount),
        )
        .filter(
            Transaction.user_id == user_id,
            func.to_char(Transaction.date, "MM") == f"{month:02d}",
            func.to_char(Transaction.date, "YYYY") == str(year),
        )
        .group_by(Transaction.type)
        .all()
    )

    totals_map = {
        "income": 0,
        "expense": 0,
    }

    for tx_type, total in totals:
        totals_map[tx_type] = float(total or 0)

    category_totals = (
        db.session.query(
            Category.name,
            func.sum(Transaction.amount),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            func.to_char(Transaction.date, "MM") == f"{month:02d}",
            func.to_char(Transaction.date, "YYYY") == str(year),
        )
        .group_by(Category.name)
        .all()
    )

    category_totals_list = [
        {
            "category_name": name,
            "total": float(total or 0),
        }
        for name, total in category_totals
    ]

    insights = generate_insights(
        budgets=budgets,
        category_month_changes=category_changes,
        category_totals=category_totals_list,
        total_income=totals_map["income"],
        total_expenses=totals_map["expense"],
    )

    response = {
        "insights": insights,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    return jsonify(
        insights_response_schema.dump(response)
    ), 200
