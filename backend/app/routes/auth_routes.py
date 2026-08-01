from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.schemas.user_schema import register_schema, login_schema, user_schema

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

    # Step 1: Validate the incoming data against our schema rules.
    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        # err.messages is a dict like {"password": ["Password must be at least 8 characters long."]}
        return jsonify({"errors": err.messages}), 400

    # Step 2: Check if an account with this email already exists.
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"errors": {"email": ["An account with this email already exists."]}}), 409

    # Step 3: Create the new user and hash their password.
    new_user = User(email=data["email"], full_name=data["full_name"])
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    # Step 4: Issue a JWT immediately, so the user is logged in right after registering.
    # We convert new_user.id to a string, since JWT identities must be strings.
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

    # Deliberately vague error message: we never reveal whether it was the
    # email or the password that was wrong. Being specific here is a real
    # security weakness — it helps attackers figure out which emails
    # are registered accounts.
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
    Protected by @jwt_required() — this decorator automatically rejects
    the request with a 401 error if no valid token is present, BEFORE
    our function body ever runs.
    """

    # get_jwt_identity() reads the user ID we stored inside the token
    # back when it was created with create_access_token(identity=...).
    current_user_id = get_jwt_identity()

    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"errors": {"general": ["User not found."]}}), 404

    return jsonify({"user": user_schema.dump(user)}), 200
