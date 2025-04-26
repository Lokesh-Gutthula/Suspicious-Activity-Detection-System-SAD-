from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from config import Config
import redis
import os
from flask_admin import Admin
from app.admin import *
from app.database import db
from dotenv import load_dotenv

load_dotenv()

migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()
admin = Admin()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    admin.init_app(app)
    # CORS(app)
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

    # print("Loaded JWT_SECRET_KEY:", app.config["JWT_SECRET_KEY"])

    # Initialize Redis
    app.redis = redis.Redis(
        host=app.config['REDIS_HOST'],
        port=app.config['REDIS_PORT'],
        password=app.config['REDIS_PASSWORD'],
        decode_responses=True  # Returns strings instead of bytes
    )

    # Ensure serve folder exists
    if not os.path.exists(app.config['SERVE_FOLDER']):
        os.makedirs(app.config['SERVE_FOLDER'])

    # The data in serve folder be serves to frontend
    @app.route('/serve/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['SERVE_FOLDER'], filename)

    # Import models here so Alembic knows about them
    from app.models import User, DetectedFrame, Video, LiveStream

    # Register blueprints (routes)
    from app.routes import auth, user, detection, dashboard, live_monitor
    app.register_blueprint(auth.main, url_prefix='/auth')
    app.register_blueprint(user.main, url_prefix='/user')
    app.register_blueprint(detection.main, url_prefix='/detection')
    app.register_blueprint(dashboard.main, url_prefix="/dashboard")
    app.register_blueprint(live_monitor.main, url_prefix='/live')

    # Flask-Admin setup
    # admin.add_view(UserAdmin(User, db.session))
    # Explicitly set a unique name
    admin.add_view(UserAdmin(User, db.session, name='user_admin_unique'))
    admin.add_view(VideoAdmin(Video, db.session, name='Videos'))
    admin.add_view(DetectedFrameAdmin(
        DetectedFrame, db.session, name='Detected Frames'))
    admin.add_view(LiveStreamAdmin(
        LiveStream, db.session, name='Live Streams'))

    return app
