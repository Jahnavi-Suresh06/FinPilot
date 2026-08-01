from marshmallow import fields

from app.extensions import ma


class CategoryBreakdownItemSchema(ma.Schema):
    """One slice of the expense-by-category breakdown (for the pie chart)."""

    category_id = fields.Integer()
    category_name = fields.String()
    color = fields.String()
    total = fields.Decimal(as_string=True)


class MonthlyTrendItemSchema(ma.Schema):
    """One month's income vs. expense totals (for the bar chart)."""

    month = fields.String()  # e.g. "2026-08"
    label = fields.String()  # e.g. "Aug 2026" — pre-formatted for display
    income = fields.Decimal(as_string=True)
    expense = fields.Decimal(as_string=True)


class DashboardSummarySchema(ma.Schema):
    """The full shape of GET /api/analytics/summary."""

    total_income = fields.Decimal(as_string=True)
    total_expenses = fields.Decimal(as_string=True)
    net_balance = fields.Decimal(as_string=True)
    transaction_count = fields.Integer()
    category_breakdown = fields.List(
        fields.Nested(CategoryBreakdownItemSchema))
    monthly_trend = fields.List(fields.Nested(MonthlyTrendItemSchema))


dashboard_summary_schema = DashboardSummarySchema()
