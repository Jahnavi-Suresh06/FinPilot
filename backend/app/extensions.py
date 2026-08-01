from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt

# These objects are created here WITHOUT an app attached yet.
# They get properly connected to our Flask app later, inside create_app(),
# using db.init_app(app). This two-step pattern is what allows other files
# (like models and routes) to safely import 'db' without causing
# circular import errors.

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
ma = Marshmallow()
migrate = Migrate()
bcrypt = Bcrypt()
