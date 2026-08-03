from datetime import datetime, timezone

from app.extensions import db, bcrypt


class User(db.Model):
    """
    Represents one registered FinPilot user.
    This table is the anchor point for almost everything else in the app —
    every category, transaction, and budget belongs to exactly one user.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)

    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    categories = db.relationship(
        "Category", backref="user", cascade="all, delete-orphan")
    transactions = db.relationship(
        "Transaction", backref="user", cascade="all, delete-orphan")
    budgets = db.relationship("Budget", backref="user",
                              cascade="all, delete-orphan")

    def set_password(self, plain_password):
        """
        Hashes a plain-text password and stores the hash.
        Called during registration AND password change. We NEVER store
        plain_password itself.
        """
        self.password_hash = bcrypt.generate_password_hash(
            plain_password).decode("utf-8")

    def check_password(self, plain_password):
        """
        Compares a plain-text password against the stored hash.
        Returns True if they match, False otherwise. Used at login AND
        when verifying the current password before allowing a change.
        """
        return bcrypt.check_password_hash(self.password_hash, plain_password)

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"
