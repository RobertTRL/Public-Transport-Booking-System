import os
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Application Configurations
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")

# Database — Render sets DATABASE_URL automatically when you attach a PostgreSQL instance.
# Render uses "postgres://..." but SQLAlchemy requires "postgresql://..."
database_url = os.getenv("DATABASE_URL", "sqlite:///dev.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
app.json.compact = False

# Initialize Extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
ma = Marshmallow(app)
api = Api(app)
CORS(app)