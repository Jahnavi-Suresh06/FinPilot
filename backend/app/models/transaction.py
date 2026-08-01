from datetime import datetime, timezone

from app.extensions import db


class Transaction(db.Model):
    """
    Represents a single financial transaction — either an income entry
    or an expense entry. Both share the same table structure, distinguished
    by the 'type' field, since income and expenses have identical shapes
    (amount, category, date, note) and querying both together is common
    for dashboards and analytics.
    """

    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey(
        "categories.id"), nullable=False)

    # We use Numeric instead of Float for money. Float uses binary
    # floating-point representation and can produce tiny rounding errors
    # (e.g. 0.1 + 0.2 != 0.3 in floating point). Numeric stores exact decimal
    # values, which is essential for anything involving currency.
    amount = db.Column(db.Numeric(12, 2), nullable=False)

    # "income" or "expense"
    type = db.Column(db.String(10), nullable=False)

    # The date the transaction actually occurred (user-chosen),
    # separate from created_at (when the database row was created).
    date = db.Column(db.Date, nullable=False)

    note = db.Column(db.String(255))

    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self):
        return f"<Transaction id={self.id} type={self.type} amount={self.amount}>"
