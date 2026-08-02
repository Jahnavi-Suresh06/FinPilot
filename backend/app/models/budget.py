from datetime import datetime, timezone

from app.extensions import db


class Budget(db.Model):
    """
    Represents a spending limit a user sets for a specific category
    in a specific month/year, e.g. 'Limit Dining Out to $300 in August 2026'.
    """

    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)

    limit_amount = db.Column(db.Numeric(12, 2), nullable=False)

    month = db.Column(db.Integer, nullable=False)  # 1-12
    year = db.Column(db.Integer, nullable=False)   # e.g. 2026

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Lets us access budget.category directly as a real Category object
    # (needed by BudgetSchema's Nested field), the same way Transaction
    # already gets its .category via Category's backref. We add the
    # relationship here, on Budget, rather than adding a second backref
    # on Category, to avoid a naming collision with Category's existing
    # 'transactions' backref="category" from the Transaction model.
    category = db.relationship("Category", backref="budgets")

    # A composite uniqueness rule: a user cannot create two budgets
    # for the same category in the same month/year. The database itself
    # will reject any attempt to violate this — a safety net beyond
    # whatever checks our application code does.
    __table_args__ = (
        db.UniqueConstraint("user_id", "category_id", "month", "year", name="unique_budget_per_period"),
    )

    def __repr__(self):
        return f"<Budget id={self.id} category_id={self.category_id} limit={self.limit_amount}>"