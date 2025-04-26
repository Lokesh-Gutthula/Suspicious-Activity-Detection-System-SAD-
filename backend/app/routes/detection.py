import math
import os
import time
import subprocess
from datetime import datetime, timedelta
import cv2
from ultralytics import YOLO
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import DetectedFrame, Video
from app.database import db
from pymediainfo import MediaInfo
import threading
import logging

main = Blueprint('detection', __name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Enable FFmpeg debug logging
os.environ["FFMPEG_LOG_LEVEL"] = "debug"

# Flask configuration
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

# In-memory status tracking
processing_status = {}

MODEL_PATH = os.path.join('..', 'backend', 'last.pt')

logger.info(f"Loading YOLO model from: {MODEL_PATH}")

try:
    model = YOLO(MODEL_PATH)
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {str(e)}")
    model = None


def allowed_file(filename):
    if not filename:
        return False
    ext = os.path.splitext(filename)[1].lower().lstrip('.')
    return ext in ALLOWED_EXTENSIONS


def get_video_creation_time(video_path):
    try:
        if video_path.startswith(('http://', 'rtsp://', 'tcp://')):
            logger.info(
                f"Stream URL detected, using current time for {video_path}")
            return datetime.now().isoformat()

        media_info = MediaInfo.parse(video_path)
        for track in media_info.tracks:
            if track.track_type == "General":
                creation_time = track.recorded_date or track.encoded_date
                if creation_time:
                    if "UTC" in creation_time:
                        creation_time = creation_time.replace(" UTC", "Z")
                    elif " " in creation_time:
                        creation_time = creation_time.replace(" ", "T") + "Z"
                    return datetime.fromisoformat(creation_time.replace("Z", "+00:00")).isoformat()
        creation_time = os.path.getctime(video_path)
        modification_time = os.path.getmtime(video_path)
        file_time = min(creation_time, modification_time)
        logger.warning(
            f"No creation time in metadata for {video_path}, using file system time")
        return datetime.fromtimestamp(file_time).isoformat()
    except Exception as e:
        logger.error(f"Error extracting video metadata for {video_path}: {e}")
        return datetime.now().isoformat()


def open_video_stream(video_path, max_attempts=3, timeout=5):
    protocols = [video_path]
    # Add fallback protocols for streams
    if video_path.startswith("tcp://"):
        protocols.append(video_path.replace("tcp://", "http://") + "/video")
        protocols.append(video_path.replace(
            "tcp://", "rtsp://").replace(":8080", ":554") + "/stream")
    elif video_path.startswith("http://"):
        protocols.append(video_path.replace(
            "http://", "rtsp://").replace(":8080", ":554") + "/stream")

    for proto in protocols:
        logger.info(f"Attempting to open stream: {proto}")
        for attempt in range(max_attempts):
            try:
                cap = cv2.VideoCapture(proto, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, timeout * 1000)
                if cap.isOpened():
                    logger.info(f"Successfully opened stream: {proto}")
                    return cap, proto
                logger.warning(
                    f"Attempt {attempt + 1}/{max_attempts} failed for {proto}")
                cap.release()
                time.sleep(2)
            except Exception as e:
                logger.error(f"Error opening {proto}: {str(e)}")
        logger.error(
            f"Failed to open stream with {proto} after {max_attempts} attempts")
    raise ValueError(f"Failed to open video stream after trying {protocols}")


def video_to_frames_ffmpeg(video_path, output_folder, target_fps=5):
    try:
        os.makedirs(output_folder, exist_ok=True)
        output_pattern = os.path.join(output_folder, "frame_%06d.jpg")
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vf", f"fps={target_fps}",
            "-q:v", "2",
            output_pattern
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        frames_list = [os.path.join(output_folder, f) for f in os.listdir(
            output_folder) if f.endswith(".jpg")]
        logger.info(f"Extracted {len(frames_list)} frames using FFmpeg")
        return frames_list, target_fps
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr.decode()}")
        return [], 0


def video_to_frames(video_path, output_folder, target_fps=5, max_frames=1000):
    logger.info(f"Extracting frames from: {video_path} at {target_fps} FPS")
    try:
        is_stream = video_path.startswith(('http://', 'rtsp://', 'tcp://'))
        cap, used_url = open_video_stream(video_path)
        # Default to 30 if FPS is invalid
        original_fps = cap.get(cv2.CAP_PROP_FPS) or 30
        logger.info(f"Original FPS: {original_fps}, Used URL: {used_url}")

        interval = int(math.ceil(original_fps) / target_fps)
        frame_count = 0
        frames_list = []
        current_frame = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                logger.info("End of stream or connection lost")
                break
            if current_frame % interval == 0:
                frame_path = os.path.join(
                    output_folder, f"frame_{frame_count:06d}.jpg")
                cv2.imwrite(frame_path, frame)
                frames_list.append(frame_path)
                frame_count += 1
            current_frame += 1
            if is_stream and frame_count >= max_frames:
                logger.info(
                    f"Reached max frame limit ({max_frames}) for stream")
                break

        cap.release()
        logger.info(f"Extracted {frame_count} frames at {target_fps} FPS.")
        return frames_list, target_fps
    except Exception as e:
        logger.error(f"Error extracting frames from {video_path}: {str(e)}")
        return [], 0


def process_frames(frames_list, output_folder, video_id, recording_time, user_id, video_record_id, fps):
    if not model:
        logger.error("YOLO model not loaded")
        processing_status[video_id] = {"status": "failed", "progress": 0}
        return []

    processed_frames = []
    total_frames = len(frames_list)
    frame_rate = 1  # Process every frame
    processed_count = 0

    try:
        confidence_thresholds = {
            "person": 0.5,
            "gun": 0.7,
            "knife": 0.7,
            "breaking": 0.6,
            "climbing": 0.6,
            "mask": 0.6,
            "thief": 0.7
        }
        suspicious_classes = ["gun", "knife", "mask",
                              "breaking glass", "climbing walls", "thief"]

        video_base_id = video_id.split('_')[0]
        serve_folder = os.path.join(
            current_app.config['SERVE_FOLDER'],
            "processed_images",
            f"user_{str(user_id)}",
            video_base_id
        )
        os.makedirs(serve_folder, exist_ok=True)
        logger.info(
            f"Created output directory for suspicious frames: {serve_folder}")

        for i, frame_path in enumerate(frames_list):
            if i % frame_rate != 0:
                continue

            frame = cv2.imread(frame_path)
            if frame is None:
                logger.error(f"Failed to read frame: {frame_path}")
                continue

            results = model.predict(source=frame, conf=0.6, save=False)[0]
            frame_classes = [results.names[int(b.cls[0])]
                             for b in results.boxes]

            for box in results.boxes:
                cls = results.names[int(box.cls[0])]
                conf = float(box.conf[0])

                if conf < confidence_thresholds.get(cls, 0.5):
                    continue

                frame_timestamp = i / fps
                frame_time = recording_time + \
                    timedelta(seconds=frame_timestamp)

                is_suspicious = False
                if cls == "person":
                    if any(label in frame_classes for label in suspicious_classes):
                        is_suspicious = True
                    if 23 <= frame_time.hour or frame_time.hour <= 5:
                        is_suspicious = True
                elif cls in suspicious_classes:
                    is_suspicious = True
                elif cls == "thief":
                    is_suspicious = True

                if is_suspicious:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    label = f"{cls} {conf:.2f}"
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                    frame_name = f"suspicious_frame_{i}_{cls}_{int(conf*100)}.jpg"
                    frame_save_path = os.path.join(serve_folder, frame_name)
                    if cv2.imwrite(frame_save_path, frame):
                        logger.info(
                            f"Saved suspicious frame: {frame_save_path}")
                    else:
                        logger.error(
                            f"Failed to save suspicious frame: {frame_save_path}")

                    relative_path = os.path.join(
                        f"user_{str(user_id)}", video_base_id, frame_name
                    ).replace('\\', '/')

                    try:
                        detection = DetectedFrame(
                            image_url=relative_path,
                            frame_name=frame_name,
                            labels=cls,
                            confidence_score=conf,
                            timestamp=frame_time.isoformat(),
                            user_id=user_id,
                            video_id=video_record_id
                        )
                        db.session.add(detection)
                        db.session.commit()
                    except Exception as db_error:
                        logger.error(
                            f"Database error adding detection: {db_error}")
                        db.session.rollback()
                        columns = [
                            column.key for column in DetectedFrame.__table__.columns]
                        logger.info(f"Available columns: {columns}")
                        valid_data = {
                            "image_url": relative_path,
                            "timestamp": frame_time.isoformat(),
                            "user_id": user_id,
                            "video_id": video_record_id
                        }
                        if "frame_name" in columns:
                            valid_data["frame_name"] = frame_name
                        if "labels" in columns:
                            valid_data["labels"] = cls
                        if "confidence_score" in columns:
                            valid_data["confidence_score"] = conf
                        try:
                            detection = DetectedFrame(**valid_data)
                            db.session.add(detection)
                            db.session.commit()
                        except Exception as e:
                            logger.error(
                                f"Second attempt to save detection failed: {e}")
                            db.session.rollback()

            output_path = os.path.join(
                output_folder, os.path.basename(frame_path))
            cv2.imwrite(output_path, frame)
            processed_frames.append(output_path)

            processed_count += frame_rate
            progress = 25 + int((processed_count / total_frames) * 75)
            processing_status[video_id]["progress"] = min(progress, 100)

        processing_status[video_id] = {"status": "completed", "progress": 100}
        logger.info(f"Finished processing frames for video {video_id}")
        return processed_frames
    except Exception as e:
        logger.error(f"Error processing frames: {str(e)}")
        processing_status[video_id] = {"status": "failed", "progress": 0}
        return []


def detect_from_video(video_path, user_id, video_id, video_record_id):
    try:
        processing_status[video_id] = {"status": "processing", "progress": 0}
        logger.info(
            f"Processing video/stream: {video_path} for user {user_id}, video_id: {video_id}")

        recording_time_str = get_video_creation_time(video_path)
        recording_time = datetime.fromisoformat(recording_time_str)
        logger.info(f"Recording time determined as: {recording_time}")

        frames_folder = os.path.join(
            current_app.config['UPLOAD_FOLDER'], f"user_{str(user_id)}", video_id
        )
        os.makedirs(frames_folder, exist_ok=True)

        frames_list, fps = video_to_frames(video_path, frames_folder)
        if not frames_list:
            logger.warning("Trying FFmpeg as fallback")
            frames_list, fps = video_to_frames_ffmpeg(
                video_path, frames_folder)
            if not frames_list:
                logger.error(f"Failed to extract frames from {video_path}")
                processing_status[video_id] = {
                    "status": "failed", "progress": 0}
                return

        processing_status[video_id]["progress"] = 25
        logger.info(f"Frame extraction complete, starting detection processing")

        processed_frames = process_frames(
            frames_list, frames_folder, video_id, recording_time, user_id, video_record_id, fps
        )

    except Exception as e:
        logger.error(f"Error processing video/stream {video_path}: {e}")
        processing_status[video_id] = {"status": "failed", "progress": 0}


def run_in_app_context(app, func, *args, **kwargs):
    with app.app_context():
        func(*args, **kwargs)


@main.route('/upload', methods=['POST'])
@jwt_required()
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400

        video = request.files['video']
        if not video or not allowed_file(video.filename):
            return jsonify({"error": "Invalid file format"}), 400

        user_id = get_jwt_identity()
        filename = video.filename
        video_path = os.path.join(
            current_app.config['UPLOAD_FOLDER'], f"user_{str(user_id)}", filename
        )
        os.makedirs(os.path.dirname(video_path), exist_ok=True)
        video.save(video_path)
        logger.info(f"Video saved at: {video_path}")

        video_record = Video(
            filename=filename,
            upload_time=datetime.utcnow(),
            user_id=user_id
        )
        db.session.add(video_record)
        db.session.commit()

        video_id = f"{video_record.id}_{filename}"
        processing_status[video_id] = {"status": "queued", "progress": 0}

        app = current_app._get_current_object()
        threading.Thread(
            target=lambda: run_in_app_context(
                app, detect_from_video, video_path, user_id, video_id, video_record.id)
        ).start()

        return jsonify({
            "message": "Video uploaded and processing started",
            "video_id": video_id,
            "filename": filename
        }), 202

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@main.route('/live/start', methods=['POST'])
@jwt_required()
def start_live_stream():
    try:
        data = request.get_json()
        video_path = data.get('stream_url')
        if not video_path:
            return jsonify({"error": "No stream URL provided"}), 400

        # Quick validation of stream
        cap = cv2.VideoCapture(video_path, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            logger.error(f"Failed to connect to stream: {video_path}")
            return jsonify({"error": "Failed to connect to stream"}), 400
        cap.release()

        user_id = get_jwt_identity()
        video_id = f"live_{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        processing_status[video_id] = {"status": "queued", "progress": 0}

        video_record = Video(
            filename=video_path,
            upload_time=datetime.utcnow(),
            user_id=user_id
        )
        db.session.add(video_record)
        db.session.commit()

        app = current_app._get_current_object()
        threading.Thread(
            target=lambda: run_in_app_context(
                app, detect_from_video, video_path, user_id, video_id, video_record.id)
        ).start()

        return jsonify({
            "message": "Live stream processing started",
            "video_id": video_id,
            "stream_url": video_path
        }), 200
    except Exception as e:
        logger.error(f"Error starting live stream: {str(e)}")
        db.session.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


@main.route('/status/<video_id>', methods=['GET'])
@jwt_required()
def check_status(video_id):
    status = processing_status.get(
        video_id, {"status": "not_found", "progress": 0})
    return jsonify(status)


@main.route('/<video_id>', methods=['GET'])
@jwt_required()
def get_detection_results(video_id):
    try:
        if '_' in video_id:
            video_id = video_id.split('_')[0]

        video = Video.query.filter_by(id=video_id).first()
        if not video:
            return jsonify({"error": "Video not found"}), 404

        detections = DetectedFrame.query.filter_by(video_id=video.id).all()
        if not detections:
            logger.warning(f"No detections found for video ID {video_id}")

        results = [
            {
                "timestamp": detection.timestamp,
                "frame_path": f"/{detection.image_url}",
                "frame_name": getattr(detection, 'frame_name', 'unknown'),
                "labels": getattr(detection, 'labels', 'unknown'),
                "confidence": getattr(detection, 'confidence_score', 0.0)
            } for detection in detections
        ]
        return jsonify({"results": results})
    except Exception as e:
        logger.error(f"Error fetching detection results: {e}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500
