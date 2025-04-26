import cv2
import os
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from datetime import datetime, timedelta
from ultralytics import YOLO
from app.models import DetectedFrame, LiveStream, User
from app.database import db
from threading import Thread, Lock
from time import sleep
from dotenv import load_dotenv

load_dotenv()

main = Blueprint('live', __name__)
model = YOLO(os.path.join('..', 'backend', 'last.pt'))

# Store thread objects and stop flags with thread-safe access
monitor_threads = {}
stop_flags = {}
thread_lock = Lock()
TARGET_FPS = 5


def send_alert_mail(app, user_email, label, timestamp):
    with app.app_context():  # Use the passed app instance
        from app import mail
        try:
            msg = Message(
                subject="🚨 Suspicious Activity Detected",
                sender=os.getenv('MAIL_USERNAME'),
                recipients=[user_email],
                body=f"Suspicious activity ({label}) detected at {timestamp}"
            )
            mail.send(msg)
            app.logger.info(
                f"Sent alert email to {user_email} for {label} at {timestamp}")
        except Exception as e:
            app.logger.error(f"Failed to send mail to {user_email}: {e}")


def detect_live(app, user_id, stream_source=0, stream_name='live_feed', user_email="admin@gmail.com"):
    with app.app_context():  # Use the passed app instance
        cap = None
        try:
            # Validate stream source
            if not isinstance(stream_source, (str, int)) or (isinstance(stream_source, str) and not stream_source):
                app.logger.error(f"Invalid stream source: {stream_source}")
                return

            app.logger.info(
                f"Starting detection for stream {stream_name} (user {user_id})")
            cap = cv2.VideoCapture(stream_source)
            if not cap.isOpened():
                app.logger.error(f"Cannot open video stream: {stream_source}")
                return

            serve_path = os.path.join(
                app.config['SERVE_FOLDER'], 'processed_images', f"user_{user_id}", stream_name)
            os.makedirs(serve_path, exist_ok=True)
            app.logger.info(f"Created output directory: {serve_path}")

            # Detection rules
            suspicious_classes = ["gun", "knife", "mask",
                                  "breaking glass", "climbing walls", "thief"]
            confidence_thresholds = {
                "person": 0.5,
                "gun": 0.7,
                "knife": 0.7,
                "breaking": 0.6,
                "climbing": 0.6,
                "mask": 0.6,
                "thief": 0.7
            }

            stop_key = f"{user_id}_{stream_name}"
            frame_count = 0  # Track frame index for naming
            # Default to 30 FPS if not available
            fps = cap.get(cv2.CAP_PROP_FPS) or 30
            frame_skip = max(1, int(fps / TARGET_FPS))

            while True:
                with thread_lock:
                    if stop_flags.get(stop_key, False):
                        app.logger.info(
                            f"Stopping stream {stream_name} for user {user_id}")
                        break

                ret, frame = cap.read()
                if not ret:
                    app.logger.warning(
                        f"Failed to grab frame for stream {stream_name}")
                    break

                frame_count += 1
                # Skip frames to achieve 5 FPS
                if frame_count % frame_skip != 0:
                    continue

                # Process frame with YOLO model
                results = model.predict(frame, conf=0.5)[0]
                frame_classes = [
                    results.names[int(b.cls[0])] for b in results.boxes]

                now = datetime.utcnow()
                is_suspicious = False
                suspicious_label = None

                for box in results.boxes:
                    cls = results.names[int(box.cls[0])]
                    conf = float(box.conf[0])

                    # Skip if confidence is below threshold
                    if conf < confidence_thresholds.get(cls, 0.5):
                        continue

                    # Apply detection rules
                    if cls == "person":
                        # Rule 1: Person with suspicious items
                        if any(label in frame_classes for label in suspicious_classes):
                            is_suspicious = True
                            suspicious_label = "person_with_suspicious_item"
                        # Rule 2: Person at night (11 PM to 5 AM)
                        elif 23 <= now.hour or now.hour <= 5:
                            is_suspicious = True
                            suspicious_label = "person_at_night"
                    elif cls in suspicious_classes:
                        # Rule 3: Weapons or intrusion objects
                        is_suspicious = True
                        suspicious_label = cls
                    elif cls == "thief":
                        # Rule 4: Thief is always suspicious
                        is_suspicious = True
                        suspicious_label = "thief"

                    if is_suspicious:
                        # Draw bounding box and label
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        label = f"{cls} {conf:.2f}"
                        cv2.rectangle(frame, (x1, y1),
                                      (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, label, (x1, y1 - 10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                if is_suspicious:
                    # Save suspicious frame
                    frame_name = f"suspicious_{suspicious_label}_{frame_count}_{int(conf * 100)}_{now.timestamp()}.jpg"
                    frame_path = os.path.join(serve_path, frame_name)
                    if cv2.imwrite(frame_path, frame):
                        app.logger.info(
                            f"Saved suspicious frame: {frame_path}")
                    else:
                        app.logger.error(
                            f"Failed to save suspicious frame: {frame_path}")

                    # Create relative path for database
                    rel_path = os.path.join(
                        f"user_{user_id}", stream_name, frame_name).replace('\\', '/')

                    # Save detection record
                    try:
                        detection = DetectedFrame(
                            image_url=rel_path,
                            frame_name=frame_name,
                            labels=suspicious_label,
                            confidence_score=conf,
                            timestamp=now.isoformat(),
                            user_id=user_id,
                            video_id=None  # No video ID for live streams
                        )
                        db.session.add(detection)
                        db.session.commit()
                        app.logger.info(
                            f"Saved detection for {suspicious_label}")
                    except Exception as e:
                        db.session.rollback()
                        app.logger.error(f"Failed to save detection: {e}")

                    # Send email alert
                    Thread(target=send_alert_mail, args=(
                        app, "Lokeshguthula9553@gmail.com", suspicious_label, now.isoformat())).start()

                frame_count += 1
                sleep(1 / fps)  # Match frame rate to avoid CPU overuse

        except Exception as e:
            app.logger.error(
                f"Error in detect_live for stream {stream_name}: {e}")
        finally:
            if cap and cap.isOpened():
                cap.release()
                app.logger.info(
                    f"Video capture released for stream {stream_name}")


@main.route('/start', methods=['POST'])
@jwt_required()
def start_monitoring():
    user_id = get_jwt_identity()

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_email = user.email
    stream_name = request.json.get('stream_name', 'webcam')
    stream_source = request.json.get('stream_url', 0)

    stop_key = f"{user_id}_{stream_name}"
    with thread_lock:
        if stop_key in stop_flags:
            stop_flags[stop_key] = False

        # Pass current_app to the thread
        t = Thread(target=detect_live, args=(
            current_app._get_current_object(), user_id, stream_source, stream_name, user_email))
        t.start()
        monitor_threads[stop_key] = t

    return jsonify({"message": f"Started monitoring {stream_name}"}), 200


@main.route('/stop', methods=['POST'])
@jwt_required()
def stop_monitoring():
    user_id = get_jwt_identity()
    stream_name = request.json.get('stream_name', 'webcam')

    stop_key = f"{user_id}_{stream_name}"

    # Stop the monitoring thread if running
    with thread_lock:
        stop_flags[stop_key] = True
        if stop_key in monitor_threads:
            monitor_threads[stop_key].join(timeout=5.0)
            del monitor_threads[stop_key]
            del stop_flags[stop_key]

    # Update the stream in DB to mark it as inactive
    stream = LiveStream.query.filter_by(
        user_id=user_id, stream_name=stream_name).first()
    if stream:
        stream.is_active = False
        db.session.commit()
        return jsonify({"message": f"Stopped monitoring {stream_name}"}), 200
    else:
        return jsonify({"error": "Stream not found"}), 404


@main.route('/livestreams', methods=['POST'])
@jwt_required()
def create_stream():
    try:
        data = request.get_json()
        name = data.get('stream_name')
        url = data.get('stream_url')
        user_id = get_jwt_identity()

        if not name or not url:
            return jsonify({'error': 'Name and URL are required'}), 400

        if LiveStream.query.filter_by(user_id=user_id, stream_name=name).first():
            return jsonify({'error': 'Stream name already exists'}), 400

        # Validate stream URL format
        if not (url.startswith(('rtsp://', 'http://', 'https://')) or url.isdigit()):
            return jsonify({'error': 'Invalid stream URL format'}), 400

        new_stream = LiveStream(
            stream_name=name,
            stream_url=url,
            user_id=user_id
        )

        db.session.add(new_stream)
        db.session.commit()

        return jsonify({'message': 'Stream created successfully', 'stream_id': new_stream.id}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create stream: {e}")
        return jsonify({'error': str(e)}), 500


@main.route('/livestreams/<int:stream_id>', methods=['DELETE'])
@jwt_required()
def delete_stream(stream_id):
    user_id = get_jwt_identity()
    stream = LiveStream.query.filter_by(id=stream_id, user_id=user_id).first()

    if not stream:
        return jsonify({'error': 'Stream not found'}), 404

    # Stop any active monitoring thread for this stream
    stop_key = f"{user_id}_{stream.stream_name}"
    with thread_lock:
        stop_flags[stop_key] = True
        if stop_key in monitor_threads:
            monitor_threads[stop_key].join(timeout=5.0)
            del monitor_threads[stop_key]
            if stop_key in stop_flags:
                del stop_flags[stop_key]

    # Delete the stream from the database
    try:
        db.session.delete(stream)
        db.session.commit()
        return jsonify({'message': 'Stream deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to delete stream: {e}")
        return jsonify({'error': 'Failed to delete stream'}), 500


@main.route('/livestreams', methods=['GET'])
@jwt_required()
def get_streams():
    user_id = get_jwt_identity()
    streams = LiveStream.query.filter_by(user_id=user_id).all()

    stream_list = [
        {
            'id': stream.id,
            'name': stream.stream_name,
            'url': stream.stream_url,
            'is_active': stream.is_active,
            'created_at': stream.created_at.isoformat()
        }
        for stream in streams
    ]
    return jsonify({'streams': stream_list}), 200
