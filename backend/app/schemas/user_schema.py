from marshmallow import fields, validate

from app.extensions import ma
from app.models.user import User


class UserSchema(ma.SQLAlchemyAutoSchema):
    """
    Controls how a User object is converted to JSON when sent to the frontend.
    By explicitly listing 'fields', we guarantee password_hash can NEVER
    accidentally leak into an API response, even if someone adds new
    columns to the User model later without thinking about this file.
    """

    class Meta:
        model = User
        # Only these fields are ever included in output — an "allowlist"
        # approach, which is much safer than trying to exclude fields.
        fields = ("id", "email", "full_name", "created_at")


class RegisterSchema(ma.Schema):
    """
    Validates incoming data for the POST /api/auth/register endpoint.
    This runs BEFORE any of our route logic — bad data never even
    reaches our database code.
    """

    email = fields.Email(required=True, error_messages={
                         "required": "Email is required."})

    password = fields.String(
        required=True,
        validate=validate.Length(
            min=8, error="Password must be at least 8 characters long."),
    )

    full_name = fields.String(
        required=True,
        validate=validate.Length(
            min=2, max=150, error="Full name must be between 2 and 150 characters."),
    )


class LoginSchema(ma.Schema):
    """Validates incoming data for the POST /api/auth/login endpoint."""

    email = fields.Email(required=True, error_messages={
                         "required": "Email is required."})
    password = fields.String(required=True, error_messages={
                             "required": "Password is required."})


# Instances we'll actually import and use in our routes.
user_schema = UserSchema()
register_schema = RegisterSchema()
login_schema = LoginSchema()
