from datetime import date
from calendar import month_abbr

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.analytics_schema import dashboard_summary_schema
from app.schemas.transaction_schema import transactions_schema

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


def _get_totals(user_id):
    """
    Uses SQL SUM(), grouped by type, to compute total income and total
    expenses in a single database query — instead of pulling every
    transaction into Python and summing manually.
    """
    results = (
        db.session.query(Transaction.type, func.sum(Transaction.amount))
        .filter(Transaction.user_id == user_id)
        .group_by(Transaction.type)
        .all()
    )

    # results looks like: [("income", Decimal("5000.00")), ("expense", Decimal("1200.00"))]
    totals = {"income": 0, "expense": 0}
    for tx_type, total in results:
        totals[tx_type] = total or 0

    return totals


def _get_category_breakdown(user_id):
    """
    Sums expense amounts, grouped by category, joined against the
    Category table to get each category's name/color for the pie chart.
    Only expenses are included — a pie chart mixing income and expense
    categories together wouldn't be meaningful.
    """
    results = (
        db.session.query(
            Category.id,
            Category.name,
            Category.color,
            func.sum(Transaction.amount).label("total"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .group_by(Category.id, Category.name, Category.color)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    return [
        {"category_id": r[0], "category_name": r[1],
            "color": r[2], "total": r[3]}
        for r in results
    ]


def _get_monthly_trend(user_id, months=6):
    """
    Builds income vs. expense totals for each of the last N months
    (including months with zero transactions, so the chart always
    shows a consistent number of bars/points, not gaps).
    """
    today = date.today()

    # Build a list of the last `months` (year, month) pairs, oldest first,
    # e.g. for August 2026 with months=6:
    # [(2026,3), (2026,4), (2026,5), (2026,6), (2026,7), (2026,8)]
    month_list = []
    year, month = today.year, today.month
    for _ in range(months):
        month_list.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    month_list.reverse()

    # One query, grouping by both year and month at once, for the entire
    # window — far more efficient than running 6 separate queries (one per month).
    results = (
        db.session.query(
            func.strftime("%Y", Transaction.date).label("year"),
            func.strftime("%m", Transaction.date).label("month"),
            Transaction.type,
            func.sum(Transaction.amount),
        )
        .filter(Transaction.user_id == user_id)
        .group_by("year", "month", Transaction.type)
        .all()
    )

    # Convert query results into a fast lookup: {"2026-08": {"income": ..., "expense": ...}}
    lookup = {}
    for year_str, month_str, tx_type, total in results:
        key = f"{year_str}-{month_str}"
        lookup.setdefault(key, {"income": 0, "expense": 0})
        lookup[key][tx_type] = total or 0

    trend = []
    for y, m in month_list:
        key = f"{y}-{m:02d}"
        entry = lookup.get(key, {"income": 0, "expense": 0})
        trend.append({
            "month": key,
            "label": f"{month_abbr[m]} {y}",
            "income": entry["income"],
            "expense": entry["expense"],
        })

    return trend


@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_summary():
    """
    Returns everything the Dashboard needs in a single request:
    totals, category breakdown, monthly trend, and recent transactions.
    Bundling these together (rather than 4 separate API calls from the
    frontend) reduces round-trips for a page that needs all of it at once.
    """
    user_id = get_jwt_identity()

    totals = _get_totals(user_id)
    total_income = totals["income"]
    total_expenses = totals["expense"]

    transaction_count = Transaction.query.filter_by(user_id=user_id).count()

    summary_data = {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": total_income - total_expenses,
        "transaction_count": transaction_count,
        "category_breakdown": _get_category_breakdown(user_id),
        "monthly_trend": _get_monthly_trend(user_id),
    }

    recent = (
        Transaction.query.filter_by(user_id=user_id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(5)
        .all()
    )

    return jsonify({
        **dashboard_summary_schema.dump(summary_data),
        "recent_transactions": transactions_schema.dump(recent),
    }), 200
