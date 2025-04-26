import os
import cv2
import torch
import uuid
import shutil
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import threading
from werkzeug.utils import secure_filename
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed_images'
MODEL_PATH = 'best.pt'
ALLOWED_EXTENSIONS = {'.mp4', '.avi', '.mov'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Load YOLO model with error handling
try:
    model = YOLO(MODEL_PATH)
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {str(e)}")
    model = None


def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


def cleanup_temp_files(temp_path):
    try:
        if os.path.exists(temp_path):
            shutil.rmtree(temp_path)
    except Exception as e:
        logger.error(f"Error cleaning up temp files: {str(e)}")


def video_to_frames(video_path, output_folder):
    print(f"** Extracting frames from: {video_path}")
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Couldn't open video file")

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = 0
        frames_list = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break   # if no more frames

            frame_path = os.path.join(
                output_folder, f"frame_{frame_count:06d}.jpg")
            cv2.imwrite(frame_path, frame)
            frames_list.append(frame_path)
            frame_count += 1

        cap.release()
        print(f"** Extracted {frame_count} frames.")
        return frames_list, fps
    except Exception as e:
        logger.error(f"Error extracting frames: {str(e)}")
        return [], 0


# def process_frames(frames_list, output_folder, video_id):
#     if not model:
#         logger.error("YOLO model not loaded")
#         return []

#     processed_frames = []
#     total_frames = len(frames_list)

#     try:
#         for i, frame_path in enumerate(frames_list):
#             frame = cv2.imread(frame_path)
#             results = model(frame)

#             for result in results:
#                 for box, conf, cls in zip(result.boxes.xyxy.cpu().numpy(),
#                                           result.boxes.conf.cpu().numpy(),
#                                           result.boxes.cls.cpu().numpy().astype(int)):
#                     x1, y1, x2, y2 = map(int, box)
#                     label = f"{model.names[cls]} {conf:.2f}"
#                     cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#                     cv2.putText(frame, label, (x1, y1 - 10),
#                                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

#             output_path = os.path.join(
#                 output_folder, os.path.basename(frame_path))
#             cv2.imwrite(output_path, frame)
#             processed_frames.append(output_path)

#             # Update progress (25% for frame extraction + 75% for processing)
#             progress = 25 + int((i + 1) * 75 / total_frames)
#             processing_status[video_id]["progress"] = min(progress, 100)

#         return processed_frames
#     except Exception as e:
#         logger.error(f"Error processing frames: {str(e)}")
#         return []


# def frames_to_video(frames_list, output_video_path, fps):
#     try:
#         if not frames_list:
#             raise ValueError("No frames to process")

#         frame = cv2.imread(frames_list[0])
#         height, width = frame.shape[:2]
#         # Use H.264 codec with proper fourcc
#         # Changed from 'mp4v' to 'avc1' for better compatibility
#         fourcc = cv2.VideoWriter_fourcc(*'avc1')
#         video = cv2.VideoWriter(
#             output_video_path, fourcc, fps, (width, height))

#         for frame_path in sorted(frames_list):
#             frame = cv2.imread(frame_path)
#             video.write(frame)

#         video.release()

#         # Verify file was created and has content
#         if not os.path.exists(output_video_path) or os.path.getsize(output_video_path) == 0:
#             raise ValueError("Video file creation failed")

#         logger.info(f"Video successfully created at {output_video_path}")
#         return True
#     except Exception as e:
#         logger.error(f"Error creating video: {str(e)}")
#         return False


# @app.route('/upload', methods=['POST'])
# def upload_video():
#     try:
#         if 'video' not in request.files:
#             return jsonify({"error": "No video file provided"}), 400

#         video = request.files['video']
#         if not video or not allowed_file(video.filename):
#             return jsonify({"error": "Invalid file format"}), 400

#         filename = secure_filename(f"{uuid.uuid4()}.mp4")
#         video_path = os.path.join(UPLOAD_FOLDER, filename)
#         video.save(video_path)
#         print(f"** video saved at: {video_path}")

#         video_id = filename.split('.')[0]
#         processing_status[video_id] = {"status": "processing", "progress": 0}

#         output_folder = os.path.join(PROCESSED_FOLDER, video_id)
#         os.makedirs(output_folder, exist_ok=True)

#         def process_video():
#             try:
#                 # Frame extraction (0-25%)
#                 processing_status[video_id]["progress"] = 0
#                 frames, fps = video_to_frames(video_path, output_folder)
#                 if not frames:
#                     processing_status[video_id] = {
#                         "status": "failed", "progress": 100}
#                     return
#                 processing_status[video_id]["progress"] = 25

#                 # Frame processing (25-100%)
#                 processed_frames = process_frames(
#                     frames, output_folder, video_id)
#                 if not processed_frames:
#                     processing_status[video_id] = {
#                         "status": "failed", "progress": 100}
#                     return

#                 output_video_path = os.path.join(PROCESSED_FOLDER, filename)
#                 success = frames_to_video(
#                     processed_frames, output_video_path, fps)

#                 processing_status[video_id] = {
#                     "status": "completed" if success else "failed",
#                     "progress": 100
#                 }
#                 cleanup_temp_files(output_folder)
#             except Exception as e:
#                 logger.error(f"Processing error: {str(e)}")
#                 processing_status[video_id] = {
#                     "status": "failed", "progress": 100}

#         threading.Thread(target=process_video, daemon=True).start()
#         return jsonify({"video_id": video_id}), 202

#     except Exception as e:
#         logger.error(f"Upload error: {str(e)}")
#         return jsonify({"error": "Server error"}), 500


# processing_status = {}


# @app.route('/status/<video_id>', methods=['GET'])
# def check_status(video_id):
#     status = processing_status.get(
#         video_id, {"status": "not_found", "progress": 0})
#     if status["status"] == "completed":
#         return jsonify({
#             "status": "completed",
#             "progress": 100,
#             "download_url": f"/download/{video_id}.mp4"
#         })
#     return jsonify(status)


# @app.route('/download/<filename>', methods=['GET'])
# def download_video(filename):
#     try:
#         file_path = os.path.join(PROCESSED_FOLDER, filename)
#         if not os.path.exists(file_path):
#             return jsonify({"error": "File not found"}), 404

#         # Set proper MIME type for video
#         return send_file(
#             file_path,
#             mimetype='video/mp4',
#             as_attachment=False,  # Allow streaming instead of forcing download
#             conditional=True
#         )
#     except Exception as e:
#         logger.error(f"Download error: {str(e)}")
#         return jsonify({"error": "Server error"}), 500


# @app.after_request
# def add_cors_headers(response):
#     response.headers['Access-Control-Allow-Origin'] = '*'
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
#     return response

