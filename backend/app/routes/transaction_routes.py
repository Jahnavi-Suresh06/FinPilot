from datetime import datetime

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction_schema import (
    transaction_schema,
    transactions_schema,
    transaction_create_schema,
)

transaction_bp = Blueprint("transactions", __name__,
                           url_prefix="/api/transactions")


def _validate_category_ownership(category_id, user_id):
    """
    Shared helper: confirms the given category exists AND belongs to
    the current user. Used by both create and update, so a user can never
    attach a transaction to someone else's category (or a category
    that doesn't exist at all).
    """
    category = Category.query.filter_by(
        id=category_id, user_id=user_id).first()
    return category


@transaction_bp.route("", methods=["GET"])
@jwt_required()
def get_transactions():
    """
    Lists transactions for the logged-in user, with optional filters:
    - ?type=income or ?type=expense
    - ?category_id=<id>
    - ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    - ?page=1&per_page=20  (pagination, since transaction lists can grow large)
    """
    user_id = get_jwt_identity()
    query = Transaction.query.filter_by(user_id=user_id)

    type_filter = request.args.get("type")
    if type_filter in ("income", "expense"):
        query = query.filter_by(type=type_filter)

    category_id = request.args.get("category_id", type=int)
    if category_id:
        query = query.filter_by(category_id=category_id)

    start_date = request.args.get("start_date")
    if start_date:
        try:
            parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= parsed_start)
        except ValueError:
            return jsonify({"errors": {"start_date": ["Invalid date format, expected YYYY-MM-DD."]}}), 400

    end_date = request.args.get("end_date")
    if end_date:
        try:
            parsed_end = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= parsed_end)
        except ValueError:
            return jsonify({"errors": {"end_date": ["Invalid date format, expected YYYY-MM-DD."]}}), 400

    # Most recent transactions first — the natural default for a finance app.
    query = query.order_by(Transaction.date.desc(), Transaction.id.desc())

    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    # hard cap, prevents someone requesting 1,000,000 rows at once
    per_page = min(per_page, 100)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": transactions_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": per_page,
    }), 200


@transaction_bp.route("", methods=["POST"])
@jwt_required()
def create_transaction():
    """Creates a new transaction owned by the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    try:
        data = transaction_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    category = _validate_category_ownership(data["category_id"], user_id)
    if not category:
        return jsonify({"errors": {"category_id": ["Category not found."]}}), 404

    # Extra business rule: a transaction's type should match its category's
    # type (you shouldn't be able to log an "income" transaction under an
    # "expense" category). Enforced here, not just trusted from the frontend.
    if category.type != data["type"]:
        return jsonify({
            "errors": {"type": [f"This category is for '{category.type}', not '{data['type']}'."]}
        }), 400

    new_transaction = Transaction(
        user_id=user_id,
        category_id=data["category_id"],
        amount=data["amount"],
        type=data["type"],
        date=data["date"],
        note=data.get("note"),
    )

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify(transaction_schema.dump(new_transaction)), 201


@transaction_bp.route("/<int:transaction_id>", methods=["PUT"])
@jwt_required()
def update_transaction(transaction_id):
    """Updates an existing transaction — only if it belongs to the logged-in user."""
    user_id = get_jwt_identity()
    json_data = request.get_json()

    transaction = Transaction.query.filter_by(
        id=transaction_id, user_id=user_id).first()
    if not transaction:
        return jsonify({"errors": {"general": ["Transaction not found."]}}), 404

    try:
        data = transaction_create_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    category = _validate_category_ownership(data["category_id"], user_id)
    if not category:
        return jsonify({"errors": {"category_id": ["Category not found."]}}), 404

    if category.type != data["type"]:
        return jsonify({
            "errors": {"type": [f"This category is for '{category.type}', not '{data['type']}'."]}
        }), 400

    transaction.category_id = data["category_id"]
    transaction.amount = data["amount"]
    transaction.type = data["type"]
    transaction.date = data["date"]
    transaction.note = data.get("note")

    db.session.commit()

    return jsonify(transaction_schema.dump(transaction)), 200


@transaction_bp.route("/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    """Deletes a transaction — only if it belongs to the logged-in user."""
    user_id = get_jwt_identity()

    transaction = Transaction.query.filter_by(
        id=transaction_id, user_id=user_id).first()
    if not transaction:
        return jsonify({"errors": {"general": ["Transaction not found."]}}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({"message": "Transaction deleted successfully."}), 200
