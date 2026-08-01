from marshmallow import fields, validate

from app.extensions import ma
from app.models.category import Category


class CategorySchema(ma.SQLAlchemyAutoSchema):
    """Controls how a Category object is converted to JSON for API responses."""

    class Meta:
        model = Category
        include_fk = True
        fields = (
            "id",
            "user_id",
            "name",
            "type",
            "icon",
            "color",
            "created_at",
        )


class CategoryCreateSchema(ma.Schema):
    """Validates incoming data for creating or updating a category."""

    name = fields.String(
        required=True,
        validate=validate.Length(
            min=1, max=100, error="Category name must be between 1 and 100 characters."),
    )

    # OneOf restricts this field to EXACTLY these two values — anything
    # else (e.g. a typo like "incom") is rejected before it ever reaches
    # our database.
    type = fields.String(
        required=True,
        validate=validate.OneOf(
            ["income", "expense"], error="Type must be either 'income' or 'expense'."),
    )

    icon = fields.String(required=False, load_default="circle")
    color = fields.String(required=False, load_default="#6366F1")


category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
category_create_schema = CategoryCreateSchema()
