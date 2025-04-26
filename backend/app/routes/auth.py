from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from flask_mail import Message
from app.database import db
from app.models import User
from app import mail, bcrypt
import json
import os
import re
import random
from dotenv import load_dotenv
load_dotenv()


main = Blueprint('auth', __name__)


@main.route('/register', methods=['POST'])
def register():
    print("ok")
    data = request.get_json()
    print(data)

    # Required fields validation
    required_fields = ['email', 'username', 'password', 'phone_no']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field.capitalize()} is required'}), 400

    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    # Validate campus email format
    print(email)
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({'message': 'Please use a valid email'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    # Generate OTP
    otp = random.randint(100000, 999999)

    # Store user data and OTP in Redis with a 5-minute expiration
    redis_client = current_app.redis
    user_data = {
        'username': data['username'],
        'email': email,
        'password': bcrypt.generate_password_hash(data['password']).decode('utf-8'),
        'phone_no': data.get('phone_no'),
        'address': data.get('address')
    }
    # user data and otp both can delete automatically, after 5 mins
    redis_client.setex(f'user:{email}', 300, json.dumps(
        user_data))  # 300 seconds = 5 minutes
    redis_client.setex(f'otp:{email}', 300, str(otp))

    sender_email = os.getenv('MAIL_USERNAME')

    # Send OTP via email
    if not sender_email:
        return jsonify({'message': 'Email configuration error'}), 500

    try:
        print("working")
        msg = Message('Your OTP', sender=sender_email, recipients=[email])
        msg.body = f'Your OTP is {otp}. Valid for 5 minutes.'
        mail.send(msg)
        print("done")
    except Exception as e:
        return jsonify({'message': f'Failed to send OTP: {str(e)}'}), 500

    return jsonify({'message': 'OTP sent to email'}), 200


@main.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data['email']
    otp = data['otp']

    redis_client = current_app.redis
    stored_otp = redis_client.get(f'otp:{email}')
    user_data_json = redis_client.get(f'user:{email}')

    if not stored_otp or not user_data_json:
        return jsonify({'message': 'OTP expired or invalid request'}), 400

    if stored_otp != otp:
        return jsonify({'message': 'Invalid OTP'}), 400

    # OTP verified, now creating user in database
    user_data = json.loads(user_data_json)
    try:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password'],
            phone_no=user_data.get('phone_no'),
            address=user_data.get('address')
        )
        db.session.add(user)
        db.session.commit()
    except:
        redis_client.delete(f'otp:{email}')
        redis_client.delete(f'user:{email}')

    # Clean up Redis
    redis_client.delete(f'otp:{email}')
    redis_client.delete(f'user:{email}')

    # Generate JWT token
    access_token = create_access_token(
        identity={'id': user.id})
    refresh_token = create_refresh_token(
        identity={'id': user.id})

    return jsonify({
        'message': 'Registration verified',
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    print(email, password)

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    # Generate both tokens
    # access_token = create_access_token(identity=str(user.id),
    #                                    additional_claims={"role": user.role})
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Login Successful',
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@main.route('/change-password', methods=['PATCH'])
@jwt_required()
def change_password():

    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    # data = request.form
    print(data)

    old_password = data['old_password']
    new_password = data['new_password']

    if not bcrypt.check_password_hash(user.password, old_password):
        return jsonify({'message': 'Incorrect old password'}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'Password changed'}), 200


@main.route('/reset-password', methods=['POST'])
def reset_password():
    email = request.json.get('email')
    new_password = request.json.get('new_password')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    otp = str(random.randint(100000, 999999))
    # OTP valid for 5 minutes

    redis_client = current_app.redis

    redis_client.setex(f"password_otp:{email}", 300, otp)
    # Store new password temporarily
    redis_client.setex(f"new_password:{email}", 300, new_password)

    sender_email = os.getenv('MAIL_USERNAME')

    # Send OTP via email
    if not sender_email:
        return jsonify({'message': 'Email configuration error'}), 500

    try:
        print("working")
        msg = Message('Your OTP', sender=sender_email, recipients=[email])
        msg.body = f'Your OTP is {otp}. Valid for 5 minutes.'
        mail.send(msg)
        print("done")
    except Exception as e:
        return jsonify({'message': f'Failed to send OTP: {str(e)}'}), 500

    return jsonify({'message': 'OTP sent to email for password reset'}), 200


@main.route('/password-otp-verify', methods=['POST'])
def password_otp_verify():
    email = request.json.get('email')
    otp = request.json.get('otp')

    redis_client = current_app.redis

    stored_otp = redis_client.get(f"password_otp:{email}")
    new_password = redis_client.get(f"new_password:{email}")

    if not stored_otp or not new_password:
        return jsonify({'message': 'OTP expired or invalid request'}), 400

    if str(otp) != stored_otp:
        return jsonify({'message': 'Incorrect OTP'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()

    # Clean up Redis
    redis_client.delete(f"password_otp:{email}")
    redis_client.delete(f"new_password:{email}")

    return jsonify({'message': 'Password successfully reset.'}), 200


@main.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)  # send valid refresh token
def refresh():
    current_user = get_jwt_identity()  # Get identity from refresh token
    new_access_token = create_access_token(identity=current_user)
    return jsonify({
        'message': 'Token refreshed',
        'access_token': new_access_token
    }), 200


@main.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out (clear token on frontend)'}), 200
# if need to store revoked tokens, use Redis
