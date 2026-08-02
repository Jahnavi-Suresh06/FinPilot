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


class ComparisonSchema(ma.Schema):
    """Shape of GET /api/analytics/comparison."""

    current_income = fields.Decimal(as_string=True)
    current_expenses = fields.Decimal(as_string=True)
    previous_income = fields.Decimal(as_string=True)
    previous_expenses = fields.Decimal(as_string=True)
    income_change_percent = fields.Float(allow_none=True)
    expense_change_percent = fields.Float(allow_none=True)


class CategoryTrendPointSchema(ma.Schema):
    """One data point: a category's total for one period, e.g. one month."""

    period = fields.String()   # e.g. "2026-08"
    label = fields.String()    # e.g. "Aug 2026"
    total = fields.Decimal(as_string=True)


class CategoryTrendSeriesSchema(ma.Schema):
    """One category's full trend line across the selected range."""

    category_id = fields.Integer()
    category_name = fields.String()
    color = fields.String()
    points = fields.List(fields.Nested(CategoryTrendPointSchema))


class TopCategoryItemSchema(ma.Schema):
    """One row in the 'Top Categories' ranked table."""

    category_id = fields.Integer()
    category_name = fields.String()
    color = fields.String()
    total = fields.Decimal(as_string=True)
    percent_of_total = fields.Float()


class AnalyticsTrendsSchema(ma.Schema):
    """Shape of GET /api/analytics/trends."""

    series = fields.List(fields.Nested(CategoryTrendSeriesSchema))
    top_categories = fields.List(fields.Nested(TopCategoryItemSchema))
    total_expenses = fields.Decimal(as_string=True)


comparison_schema = ComparisonSchema()
analytics_trends_schema = AnalyticsTrendsSchema()
