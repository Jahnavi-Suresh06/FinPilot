from marshmallow import fields, validate

from app.extensions import ma
from app.models.budget import Budget


class BudgetSchema(ma.SQLAlchemyAutoSchema):
    """
    Controls how a Budget is converted to JSON. Includes computed fields
    (spent, remaining, percent_used) that don't exist as real database
    columns — they're calculated fresh on every request in the route,
    then attached onto the object before serialization (see routes below).
    """

    class Meta:
        model = Budget
        fields = (
            "id",
            "user_id",
            "category_id",
            "limit_amount",
            "month",
            "year",
            "created_at",
            "category",
            "spent",
            "remaining",
            "percent_used",
        )

    category = fields.Nested(
        "CategorySchema", only=("id", "name", "icon", "color"), dump_only=True
    )

    # dump_only=True: these are only ever OUTPUT, never accepted as input —
    # they're calculated server-side, a user could never legitimately
    # "set" their own spent amount.
    spent = fields.Decimal(as_string=True, dump_only=True)
    remaining = fields.Decimal(as_string=True, dump_only=True)
    percent_used = fields.Float(dump_only=True)


class BudgetCreateSchema(ma.Schema):
    """Validates incoming data for creating or updating a budget."""

    category_id = fields.Integer(required=True, error_messages={
                                 "required": "Category is required."})

    limit_amount = fields.Decimal(
        required=True,
        as_string=False,
        validate=validate.Range(
            min=0.01, error="Budget limit must be greater than 0."),
    )

    month = fields.Integer(
        required=True,
        validate=validate.Range(
            min=1, max=12, error="Month must be between 1 and 12."),
    )

    year = fields.Integer(
        required=True,
        validate=validate.Range(
            min=2000, max=2100, error="Please enter a valid year."),
    )


budget_schema = BudgetSchema()
budgets_schema = BudgetSchema(many=True)
budget_create_schema = BudgetCreateSchema()
