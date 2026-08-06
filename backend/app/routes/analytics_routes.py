from datetime import date
from calendar import month_abbr

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.analytics_schema import (
    dashboard_summary_schema,
    comparison_schema,
    analytics_trends_schema,
)
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

    totals = {"income": 0, "expense": 0}
    for tx_type, total in results:
        totals[tx_type] = total or 0

    return totals


def _get_category_breakdown(user_id):
    """
    Sums expense amounts, grouped by category, joined against the
    Category table to get each category's name/color for the pie chart.
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

    month_list = []
    year, month = today.year, today.month
    for _ in range(months):
        month_list.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    month_list.reverse()

    results = (
        db.session.query(
            func.extract("year", Transaction.date).label("year"),
            func.extract("month", Transaction.date).label("month"),
            Transaction.type,
            func.sum(Transaction.amount),
        )
        .filter(Transaction.user_id == user_id)
        .group_by("year", "month", Transaction.type)
        .all()
    )

    lookup = {}
    for year_val, month_val, tx_type, total in results:
        key = f"{int(year_val)}-{int(month_val):02d}"
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


def _period_bounds(month, year):
    """Returns the first and last calendar day of a given month/year."""
    import calendar
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def _previous_period(month, year):
    """Returns the (month, year) immediately before the given one."""
    if month == 1:
        return 12, year - 1
    return month - 1, year


@analytics_bp.route("/comparison", methods=["GET"])
@jwt_required()
def get_comparison():
    """
    Compares totals for a given month/year against the immediately
    preceding month. Defaults to the current month if not specified.
    """
    user_id = get_jwt_identity()

    month = request.args.get("month", type=int, default=date.today().month)
    year = request.args.get("year", type=int, default=date.today().year)
    prev_month, prev_year = _previous_period(month, year)

    current_start, current_end = _period_bounds(month, year)
    previous_start, previous_end = _period_bounds(prev_month, prev_year)

    def totals_for_range(start, end):
        results = (
            db.session.query(Transaction.type, func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == user_id,
                Transaction.date >= start,
                Transaction.date <= end,
            )
            .group_by(Transaction.type)
            .all()
        )
        totals = {"income": 0, "expense": 0}
        for tx_type, total in results:
            totals[tx_type] = total or 0
        return totals

    current = totals_for_range(current_start, current_end)
    previous = totals_for_range(previous_start, previous_end)

    def percent_change(old, new):
        if not old:
            return None
        return round((float(new) - float(old)) / float(old) * 100, 1)

    data = {
        "current_income": current["income"],
        "current_expenses": current["expense"],
        "previous_income": previous["income"],
        "previous_expenses": previous["expense"],
        "income_change_percent": percent_change(previous["income"], current["income"]),
        "expense_change_percent": percent_change(previous["expense"], current["expense"]),
    }

    return jsonify(comparison_schema.dump(data)), 200


@analytics_bp.route("/trends", methods=["GET"])
@jwt_required()
def get_trends():
    """
    Returns per-category expense trends across a custom date range
    (?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD), grouped by month,
    plus a ranked 'top categories' summary for that same range.
    Defaults to the last 6 months if no range is given.
    """
    from dateutil.relativedelta import relativedelta

    user_id = get_jwt_identity()

    end_date_str = request.args.get("end_date")
    start_date_str = request.args.get("start_date")

    end_dt = date.today() if not end_date_str else date.fromisoformat(end_date_str)
    start_dt = (
        (end_dt - relativedelta(months=6)
         ) if not start_date_str else date.fromisoformat(start_date_str)
    )

    rows = (
        db.session.query(
            Category.id,
            Category.name,
            Category.color,
            (func.extract("year", Transaction.date) * 100 +
             func.extract("month", Transaction.date)).label("period_num"),
            func.sum(Transaction.amount).label("total"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= start_dt,
            Transaction.date <= end_dt,
        )
        .group_by(Category.id, Category.name, Category.color, "period_num")
        .order_by("period_num")
    )

    series_map = {}
    grand_total = 0

    for cat_id, cat_name, color, period_num, total in rows:
        total = total or 0
        grand_total += float(total)

        if cat_id not in series_map:
            series_map[cat_id] = {
                "category_id": cat_id,
                "category_name": cat_name,
                "color": color,
                "points": [],
                "_total": 0,
            }

        period_num = int(period_num)
        year_val, month_val = divmod(period_num, 100)
        period = f"{year_val}-{month_val:02d}"
        label = f"{month_abbr[month_val]} {year_val}"

        series_map[cat_id]["points"].append(
            {"period": period, "label": label, "total": total})
        series_map[cat_id]["_total"] += float(total)

    series = list(series_map.values())

    top_categories = sorted(
        [
            {
                "category_id": s["category_id"],
                "category_name": s["category_name"],
                "color": s["color"],
                "total": s["_total"],
                "percent_of_total": round((s["_total"] / grand_total) * 100, 1) if grand_total else 0,
            }
            for s in series
        ],
        key=lambda x: x["total"],
        reverse=True,
    )

    data = {
        "series": series,
        "top_categories": top_categories,
        "total_expenses": grand_total,
    }

    return jsonify(analytics_trends_schema.dump(data)), 200
