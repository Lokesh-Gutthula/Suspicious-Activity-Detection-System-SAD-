# dashboard.py

from flask import Blueprint, jsonify, request
from app.models import Video, DetectedFrame
from flask_jwt_extended import jwt_required, get_jwt_identity

main = Blueprint("dashboard", __name__)


@main.route('/videos', methods=['GET'])
@jwt_required()
def get_user_videos():
    try:
        user_id = get_jwt_identity()
        videos = Video.query.filter_by(user_id=user_id).order_by(
            Video.upload_time.desc()).all()

        video_data = []
        for video in videos:
            detections = DetectedFrame.query.filter_by(
                video_id=video.id).count()
            video_data.append({
                "id": video.id,
                "filename": video.filename,
                "upload_time": video.upload_time.isoformat(),
                "detections": detections
            })

        return jsonify({"videos": video_data})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
