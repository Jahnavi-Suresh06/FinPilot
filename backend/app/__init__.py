from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, jwt, cors, ma, migrate, bcrypt


def create_app(config_name="development"):
    """
    Application factory function.
    """

    app = Flask(__name__)

    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    ma.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    from app.models import user, category, transaction, budget

    from app.routes.auth_routes import auth_bp
    from app.routes.category_routes import category_bp
    from app.routes.transaction_routes import transaction_bp
    from app.routes.analytics_routes import analytics_bp
    from app.routes.budget_routes import budget_bp
    from app.routes.ai_routes import ai_bp
    from app.routes.export_routes import export_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(transaction_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(export_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "FinPilot backend is running"
        })

    return app
