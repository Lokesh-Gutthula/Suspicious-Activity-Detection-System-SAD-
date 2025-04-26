import os
from dotenv import load_dotenv
load_dotenv()


class Config:
    # MySQL connection for localhost
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Email settings for OTP verification
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    SERVE_FOLDER = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'serve')

    UPLOAD_FOLDER = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), 'uploads')

    # Redis configuration
    REDIS_HOST = os.getenv('REDIS_HOST')
    REDIS_PORT = int(os.getenv('REDIS_PORT'))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')

    # Json Web Token
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')   # Secret for encoding JWTs
    JWT_ACCESS_TOKEN_EXPIRES = 172800  # 2days
    JWT_REFRESH_TOKEN_EXPIRES = 604800  # 7 days

#       Model Path
    # MODEL_PATH = os.path.abspath("best.pt")
