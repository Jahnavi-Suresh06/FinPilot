from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget_schema import budget_schema, budgets_schema, budget_create_schema

budget_bp = Blueprint("budgets", __name__, url_prefix="/api/budgets")


def _attach_progress(budget):
    """
    Computes how much has been spent against a single budget's category,
    for that budget's specific month/year, and attaches the result
    directly onto the Budget object as extra attributes. This works
    because Python objects can hold attributes beyond their declared
    database columns — SQLAlchemy doesn't mind the extra attributes,
    and our schema (dump_only fields) knows to read them at output time.
    """
    spent = (
        db.session.query(func.sum(Transaction.amount))
        .filter(
            Transaction.user_id == budget.user_id,
            Transaction.category_id == budget.category_id,
            Transaction.type == "expense",
            func.strftime("%m", Transaction.date) == f"{budget.month:02d}",
            func.strftime("%Y", Transaction.date) == str(budget.year),
        )
        .scalar()
    ) or 0

    budget.spent = spent
    budget.remaining = budget.limit_amount - spent
    budget.percent_used = round(
        (float(spent) / float(budget.limit_amount)) * 100, 1) if budget.limit_amount else 0

    return budget


@budget_bp.route("", methods=["GET"])
@jwt_required()
def get_budgets():
    """
    Lists budgets for the logged-in user, each with live spending progress
    attached. Supports optional ?month=8&year=2026 filtering — defaults
    to the current month if not provided, since "my budgets" almost
    always means "my budgets for right now."
    """
    from datetime import date

    user_id = get_jwt_identity()

    month = request.args.get("month", type=int, default=date.today().month)
    year = request.args.get("year", type=int, default=date.today().year)

    budgets = (
        Budget.query.filter_by(user_id=user_id, month=month, year=year)
        .join(Category)
        .order_by(Category.name.asc())
        .all()
    )

    for b in budgets:
        _attach_progress(b)

    return jsonify(budgets_schema.dump(budgets)), 200


@budget_bp.route("", methods=["POST"])
@jwt_required()
def create_budget():
    """Creates a new budget for the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    try:
        data = budget_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    category = Category.query.filter_by(
        id=data["category_id"], user_id=user_id).first()
    if not category:
        return jsonify({"errors": {"category_id": ["Category not found."]}}), 404

    if category.type != "expense":
        return jsonify({"errors": {"category_id": ["Budgets can only be set on expense categories."]}}), 400

    new_budget = Budget(
        user_id=user_id,
        category_id=data["category_id"],
        limit_amount=data["limit_amount"],
        month=data["month"],
        year=data["year"],
    )

    db.session.add(new_budget)

    try:
        db.session.commit()
    except IntegrityError:
        # Triggered by the UniqueConstraint we defined back in Phase 3
        # (one budget per category per month/year). Rolling back is
        # essential here — without it, the failed half-committed change
        # would leave our database session in a broken state for any
        # subsequent query in this same request.
        db.session.rollback()
        return jsonify({
            "errors": {"general": ["A budget for this category and month already exists."]}
        }), 409

    _attach_progress(new_budget)
    return jsonify(budget_schema.dump(new_budget)), 201


@budget_bp.route("/<int:budget_id>", methods=["PUT"])
@jwt_required()
def update_budget(budget_id):
    """Updates an existing budget — only if it belongs to the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"errors": {"general": ["Budget not found."]}}), 404

    try:
        data = budget_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    category = Category.query.filter_by(
        id=data["category_id"], user_id=user_id).first()
    if not category:
        return jsonify({"errors": {"category_id": ["Category not found."]}}), 404

    if category.type != "expense":
        return jsonify({"errors": {"category_id": ["Budgets can only be set on expense categories."]}}), 400

    budget.category_id = data["category_id"]
    budget.limit_amount = data["limit_amount"]
    budget.month = data["month"]
    budget.year = data["year"]

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "errors": {"general": ["A budget for this category and month already exists."]}
        }), 409

    _attach_progress(budget)
    return jsonify(budget_schema.dump(budget)), 200


@budget_bp.route("/<int:budget_id>", methods=["DELETE"])
@jwt_required()
def delete_budget(budget_id):
    """Deletes a budget — only if it belongs to the logged-in user."""
    user_id = get_jwt_identity()

    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return jsonify({"errors": {"general": ["Budget not found."]}}), 404

    db.session.delete(budget)
    db.session.commit()

    return jsonify({"message": "Budget deleted successfully."}), 200
