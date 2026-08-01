from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.category import Category
from app.schemas.category_schema import (
    category_schema,
    categories_schema,
    category_create_schema,
)

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@category_bp.route("", methods=["GET"])
@jwt_required()
def get_categories():
    """
    Lists all categories belonging to the logged-in user.
    Supports an optional ?type=income or ?type=expense query filter.
    """
    user_id = get_jwt_identity()

    query = Category.query.filter_by(user_id=user_id)

    type_filter = request.args.get("type")
    if type_filter in ("income", "expense"):
        query = query.filter_by(type=type_filter)

    categories = query.order_by(Category.name.asc()).all()
    return jsonify(categories_schema.dump(categories)), 200


@category_bp.route("", methods=["POST"])
@jwt_required()
def create_category():
    """Creates a new category owned by the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    try:
        data = category_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # Prevent duplicate category names of the same type for the same user
    # (e.g. two "Groceries" expense categories would be confusing).
    existing = Category.query.filter_by(
        user_id=user_id, name=data["name"], type=data["type"]
    ).first()
    if existing:
        return jsonify({"errors": {"name": ["A category with this name already exists."]}}), 409

    new_category = Category(
        user_id=user_id,
        name=data["name"],
        type=data["type"],
        icon=data["icon"],
        color=data["color"],
    )

    db.session.add(new_category)
    db.session.commit()

    return jsonify(category_schema.dump(new_category)), 201


@category_bp.route("/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id):
    """Updates an existing category — but ONLY if it belongs to the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    # This filter_by(user_id=..., id=...) combo is critical: it prevents
    # User A from editing User B's category just by guessing an ID number.
    # This is a real, common security concept called an "IDOR" vulnerability
    # (Insecure Direct Object Reference) — always scope queries to the
    # current user, never trust an ID alone.
    category = Category.query.filter_by(
        id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({"errors": {"general": ["Category not found."]}}), 404

    try:
        data = category_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    category.name = data["name"]
    category.type = data["type"]
    category.icon = data["icon"]
    category.color = data["color"]

    db.session.commit()

    return jsonify(category_schema.dump(category)), 200


@category_bp.route("/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    """Deletes a category — but ONLY if it belongs to the logged-in user."""
    user_id = get_jwt_identity()

    category = Category.query.filter_by(
        id=category_id, user_id=user_id).first()
    if not category:
        return jsonify({"errors": {"general": ["Category not found."]}}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "Category deleted successfully."}), 200
