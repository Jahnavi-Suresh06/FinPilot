from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import (
    register_schema,
    login_schema,
    user_schema,
    update_profile_schema,
    change_password_schema,
)

# A Blueprint groups related routes together. 'auth_bp' is just a Python
# variable name; "auth" (the second argument) is Flask's internal name
# for this blueprint, used for things like error messages and URL building.
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Creates a new user account.
    Expects JSON body: { "email": "...", "password": "...", "full_name": "..." }
    """

    json_data = request.get_json()

    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"errors": {"email": ["An account with this email already exists."]}}), 409

    new_user = User(email=data["email"], full_name=data["full_name"])
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "message": "Account created successfully.",
        "user": user_schema.dump(new_user),
        "access_token": access_token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Logs in an existing user.
    Expects JSON body: { "email": "...", "password": "..." }
    """

    json_data = request.get_json()

    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"errors": {"general": ["Invalid email or password."]}}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Logged in successfully.",
        "user": user_schema.dump(user),
        "access_token": access_token,
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Returns the currently logged-in user's data.
    """
    current_user_id = get_jwt_identity()

    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"errors": {"general": ["User not found."]}}), 404

    return jsonify({"user": user_schema.dump(user)}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    Updates the logged-in user's full_name and email.
    Expects JSON body: { "full_name": "...", "email": "..." }
    Returns 200 with the updated user object on success.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"errors": {"general": ["User not found."]}}), 404

    json_data = request.get_json()

    try:
        data = update_profile_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    # If the email is changing, confirm no OTHER account already uses it.
    # We exclude the current user's own row (User.id != user.id) so that
    # saving the profile WITHOUT changing the email doesn't incorrectly
    # get rejected as "already taken" by the user's own existing record.
    if data["email"] != user.email:
        existing = User.query.filter(
            User.email == data["email"], User.id != user.id).first()
        if existing:
            return jsonify({"errors": {"email": ["An account with this email already exists."]}}), 409

    user.full_name = data["full_name"]
    user.email = data["email"]

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully.",
        "user": user_schema.dump(user),
    }), 200


@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():
    """
    Changes the logged-in user's password.
    Expects JSON body: { "current_password": "...", "new_password": "..." }
    Requires the CURRENT password to be correct before allowing the change
    (protects against session hijacking via unattended, logged-in devices).
    Returns 401 if current_password is wrong, 200 on success.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"errors": {"general": ["User not found."]}}), 404

    json_data = request.get_json()

    try:
        data = change_password_schema.load(json_data)
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    if not user.check_password(data["current_password"]):
        return jsonify({"errors": {"current_password": ["Current password is incorrect."]}}), 401

    user.set_password(data["new_password"])
    db.session.commit()

    return jsonify({"message": "Password changed successfully."}), 200
