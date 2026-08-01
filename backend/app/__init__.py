from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, jwt, cors, ma, migrate, bcrypt


def create_app(config_name="development"):
    """
    Application factory function.

    Instead of creating the Flask app at import time, we build it
    fresh inside this function. This lets us create multiple app
    instances with different configurations (development, testing,
    production) without any of them interfering with each other.
    """

    app = Flask(__name__)

    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Import models so Flask-Migrate can detect tables to create/update.
    from app.models import user, category, transaction, budget

    # Register blueprints: this is how Flask "plugs in" a group of routes
    # defined in a separate file into the main application.
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "FinPilot backend is running"
        })

    return app
