from marshmallow import fields, validate

from app.extensions import ma
from app.models.transaction import Transaction


class TransactionSchema(ma.SQLAlchemyAutoSchema):
    """Controls how a Transaction is converted to JSON for API responses."""

    class Meta:
        model = Transaction
        fields = (
            "id",
            "user_id",
            "category_id",
            "amount",
            "type",
            "date",
            "note",
            "created_at",
            "updated_at",
            "category",
        )

    # Nest the category's basic info directly inside each transaction response,
    # so the frontend doesn't need a second lookup just to show a category
    # name/color/icon next to each transaction row.
    category = fields.Nested(
        "CategorySchema", only=("id", "name", "icon", "color", "type"), dump_only=True
    )


class TransactionCreateSchema(ma.Schema):
    """Validates incoming data for creating or updating a transaction."""

    category_id = fields.Integer(required=True, error_messages={
                                 "required": "Category is required."})

    # Positive-only: you cannot log a transaction of $0 or a negative amount.
    # We keep amount always positive; 'type' (income/expense) carries the sign meaning.
    amount = fields.Decimal(
        required=True,
        as_string=False,
        validate=validate.Range(
            min=0.01, error="Amount must be greater than 0."),
    )

    type = fields.String(
        required=True,
        validate=validate.OneOf(
            ["income", "expense"], error="Type must be either 'income' or 'expense'."),
    )

    date = fields.Date(required=True, error_messages={
                       "required": "Date is required."})

    note = fields.String(required=False, allow_none=True,
                         validate=validate.Length(max=255))


transaction_schema = TransactionSchema()
transactions_schema = TransactionSchema(many=True)
transaction_create_schema = TransactionCreateSchema()
