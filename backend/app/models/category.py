from datetime import datetime, timezone

from app.extensions import db


class Category(db.Model):
    """
    Represents a spending or income category, e.g. 'Groceries', 'Salary'.
    Categories are owned by a single user (each user builds their own list),
    and every transaction belongs to exactly one category.
    """

    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)

    # Foreign key: links this row to exactly one row in the 'users' table.
    # This is what makes categories "belong" to a specific user.
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    name = db.Column(db.String(100), nullable=False)

    # "income" or "expense" — we restrict this using application-level
    # validation (Marshmallow, in a later phase) rather than a database enum,
    # which keeps things simpler while we're moving fast.
    type = db.Column(db.String(10), nullable=False)

    # Name of a Lucide icon to display for this category in the UI,
    # e.g. "shopping-cart", "home", "briefcase".
    icon = db.Column(db.String(50), default="circle")

    # Hex color code for this category's visual theme in charts, e.g. "#6366F1"
    color = db.Column(db.String(20), default="#6366F1")

    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Reverse relationship: lets us write category.transactions
    transactions = db.relationship(
        "Transaction", backref="category", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Category id={self.id} name={self.name} type={self.type}>"
