import os
from datetime import timedelta

# BASE_DIR points to the 'backend' folder itself.
# We use this to build reliable, absolute file paths (e.g. for our SQLite file),
# so the app works correctly no matter which folder you run it from.
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# SQLite cannot create a missing folder on its own — only the file inside it.
# So we ensure the 'instance' folder exists here, before any config below
# tries to point a database URI into it.
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
os.makedirs(INSTANCE_DIR, exist_ok=True)


class Config:
    """
    Base configuration shared by all environments.
    Specific environments (development, production, testing)
    will inherit from this and override only what they need.
    """

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-later")
    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY", "dev-jwt-secret-change-later")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    """Configuration used while we build the project locally."""

    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + \
        os.path.join(INSTANCE_DIR, "finpilot.db")


class ProductionConfig(Config):
    """Configuration used later when we deploy the real app (Phase 18)."""

    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "")


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
