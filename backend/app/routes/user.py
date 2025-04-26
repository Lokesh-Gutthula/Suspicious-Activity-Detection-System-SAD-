from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.models import User, DetectedFrame
import os
from .detection import detect_from_video
from dotenv import load_dotenv
load_dotenv()



main = Blueprint('user', __name__)


@main.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # print("Verifying token with JWT_SECRET_KEY:", current_app.config['JWT_SECRET_KEY'])
    # print(request.get_json())
    user_id = get_jwt_identity()
    print("hai", user_id)

    user = User.query.get_or_404(user_id)
    return jsonify({
        'username': user.username,
        'email': user.email,
        'phone_no': user.phone_no,
        'picture': user.picture,
        'address': user.address
    }), 200


@main.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.form

    # Update only if the field exists in the request
    if 'username' in data:
        user.username = data['username']
    if 'phone_no' in data:
        user.phone_no = data['phone_no']
    if 'address' in data:
        user.address = data['address']

    # Handle profile image upload
    picture = request.files.get('picture')
    if picture:
        picture_path = os.path.join(current_app.config['SERVE_FOLDER'], 'profile', f"{user_id}.jpg")
        # Check if the user already has a profile image and delete it
        if user.picture:
            old_picture_path = os.path.join(current_app.config['SERVE_FOLDER'], 'profile', user.picture)
            if os.path.exists(old_picture_path):
                try:
                    os.remove(old_picture_path)
                except Exception as e:
                    return jsonify({'message': 'Error deleting old picture', 'error': str(e)}), 500

        if picture_path:
            picture.save(picture_path)
            user.picture = f"{user_id}.jpg"
        elif picture_path is None:
            return jsonify({'message': 'Invalid picture file type'}), 400

    db.session.commit()
    return jsonify({
        'message': 'Profile updated',
        'user': {
            'username': user.username,
            'phone_no': user.phone_no,
            'address': user.address,
            'picture': user.picture
        }
    }), 200


@main.route('/upload', methods=['POST'])
@jwt_required()
def upload_video():
    
    current_user = get_jwt_identity()
    
    video = request.files.get('video')
    if not video:
        return jsonify({'message': 'No video file provided'}), 400
    
    filename = video.filename

    
    # Create a folder for the user inside the "uploads" directory
    user_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(current_user['id']))
    os.makedirs(user_folder, exist_ok=True)

    # Save the video file to the user's specific folder
    save_path = os.path.join(user_folder, filename)
    video.save(save_path)
    

    results = detect_from_video(save_path, str(current_user['id']), filename)

    # Save results to DB
    for res in results:
        df = DetectedFrame(timestamp=res['timestamp'], image_url=res['frame_path'],
                           labels=res['labels'], confidence=res['confidence'])
        db.session.add(df)
    db.session.commit()

    # Delete the uploaded video file after processing
    if os.path.exists(save_path):
        os.remove(save_path)

    return jsonify(results)

