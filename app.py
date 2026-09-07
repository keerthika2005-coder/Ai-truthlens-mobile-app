"""
AI TruthLens - AI-Generated Image Detection System
Flask Web Application Entrypoint
"""
import os
import sys
import tempfile
import argparse
import logging
import threading
from flask import Flask, render_template, request, jsonify

from config import Config
from services.detector import TruthLensDetector
from utils.image_utils import (
    allowed_file,
    is_image_file,
    is_video_file,
    validate_and_open_image,
    get_safe_filename,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("TruthLens.App")

# Initialize Flask application
app = Flask(__name__, template_folder="templates", static_folder="static")
app.config.from_object(Config)

# Ensure upload directory exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Non-blocking model initialization with thread safety
detector = None
detector_init_error = None
detector_ready_event = threading.Event()
_init_lock = threading.Lock()


def _initialize_detector_worker():
    """Loads deep learning model in a worker thread to ensure immediate port binding."""
    global detector, detector_init_error
    try:
        logger.info("Initializing AI TruthLens Pretrained Detector in background...")
        detector = TruthLensDetector(model_name=app.config["MODEL_NAME"])
        logger.info("AI TruthLens Pretrained Detector ready for inference.")
    except Exception as e:
        detector_init_error = str(e)
        logger.error(f"Detector initialization failed: {e}", exc_info=True)
    finally:
        detector_ready_event.set()


def get_detector(timeout: float = 12.0):
    """
    Returns the loaded TruthLensDetector instance, waiting if initialization is still in progress.
    Performs fallback synchronous initialization if needed.
    """
    global detector, detector_init_error
    if detector is not None:
        return detector

    # Wait for the background thread to complete loading
    detector_ready_event.wait(timeout=timeout)
    if detector is not None:
        return detector

    with _init_lock:
        if detector is None:
            if detector_init_error:
                logger.warning(f"Detector had initialization error: {detector_init_error}. Retrying...")
            try:
                logger.info("Executing on-demand initialization of TruthLensDetector...")
                detector = TruthLensDetector(model_name=app.config["MODEL_NAME"])
                detector_init_error = None
                detector_ready_event.set()
                logger.info("TruthLensDetector successfully initialized on-demand.")
            except Exception as e:
                detector_init_error = str(e)
                logger.error(f"On-demand detector initialization failed: {e}", exc_info=True)
                raise RuntimeError(f"Detector model initialization failed: {e}")

    return detector


# Start loading in background thread immediately so Flask binds port 3000 in <0.1s
_init_thread = threading.Thread(target=_initialize_detector_worker, daemon=True)
_init_thread.start()


@app.after_request
def apply_headers(response):
    """Apply CORS and security headers to all responses."""
    origin = request.headers.get("Origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/", methods=["GET"])
def index():
    """Serves the primary AI TruthLens application page."""
    return render_template("index.html")


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for container lifecycle and warmup monitoring."""
    is_ready = detector_ready_event.is_set() and detector is not None
    return jsonify({
        "status": "ok",
        "service": "AI TruthLens",
        "detector_ready": is_ready,
        "warming_up": not detector_ready_event.is_set(),
        "model": app.config["MODEL_NAME"],
    }), 200


@app.route("/api/analyze", methods=["POST", "OPTIONS"])
@app.route("/api/analyze/image", methods=["POST", "OPTIONS"])
@app.route("/api/analyze/video", methods=["POST", "OPTIONS"])
def analyze_media():
    """
    Primary API endpoint for real deep learning image & video inference.
    
    Accepts:
        multipart/form-data with 'image', 'video', or 'file' field.
        
    Returns:
        JSON:
        {
            "result": "AI" | "REAL",
            "reason": "...",
            "media_type": "image" | "video",
            ...
        }
    """
    # Pre-flight OPTIONS request handling
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    # 1. Obtain detector safely with wait / fallback
    try:
        active_detector = get_detector(timeout=12.0)
    except Exception as e:
        logger.error(f"Failed to obtain active detector: {e}", exc_info=True)
        return jsonify({
            "error": f"The AI detection model failed to initialize: {str(e)}"
        }), 500

    if active_detector is None:
        logger.warning(f"Inference attempted while detector is uninitialized. Error: {detector_init_error}")
        return jsonify({
            "error": "The AI detection model is warming up. Please try again in a few seconds.",
            "warming_up": True
        }), 503

    # 2. Check for media file in request (support 'image', 'video', 'file', 'media')
    file = None
    for field_key in ["image", "video", "file", "media"]:
        if field_key in request.files:
            file = request.files[field_key]
            break

    if file is None:
        if len(request.files) > 0:
            file = next(iter(request.files.values()))

    if file is None:
        logger.warning("Analyze request rejected: missing media file in request.files.")
        return jsonify({"error": "No media file provided. Please select an image or video to analyze."}), 400

    # 3. Check filename presence
    if not file or not file.filename or file.filename.strip() == "":
        logger.warning("Analyze request rejected: empty filename.")
        return jsonify({"error": "No media file selected. Please choose a JPG, PNG, WEBP image or MP4, WEBM, MOV video."}), 400

    filename = file.filename.strip()

    # 4. Check allowed extension
    if not allowed_file(filename):
        logger.warning(f"Analyze request rejected: unsupported file extension '{filename}'.")
        return jsonify({
            "error": "Unsupported file format. Please upload a valid JPG, JPEG, PNG, or WEBP image, or MP4, WEBM, MOV video."
        }), 400

    # 5. Route to Video or Image processing based on file type
    if is_video_file(filename):
        # Video Processing Pipeline
        ext = filename.rsplit(".", 1)[1].lower()
        temp_fd, temp_path = tempfile.mkstemp(suffix=f".{ext}", prefix="truthlens_vid_")
        try:
            with os.fdopen(temp_fd, "wb") as f_out:
                file.save(f_out)

            max_frames = app.config.get("MAX_VIDEO_FRAMES_SAMPLE", 6)
            logger.info(f"Running video inference on '{filename}' (max {max_frames} frames)...")
            video_result = active_detector.predict_video(temp_path, max_frames=max_frames)
            return jsonify(video_result), 200

        except ValueError as ve:
            logger.warning(f"Video validation failed for '{filename}': {ve}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            logger.error(f"Video analysis error on file '{filename}': {e}", exc_info=True)
            return jsonify({
                "error": "Failed to analyze video. Please verify the file is not corrupted or in an unsupported codec."
            }), 400
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    else:
        # Image Processing Pipeline
        try:
            pil_image = validate_and_open_image(file.stream)
        except ValueError as ve:
            logger.warning(f"Image validation rejected: {ve}")
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            logger.error(f"Unexpected error validating image: {e}")
            return jsonify({
                "error": "Failed to process the uploaded image. Please ensure the file is not corrupted."
            }), 400

        # Real Machine Learning Inference
        try:
            logger.info(f"Running model inference on image '{filename}' ({pil_image.size[0]}x{pil_image.size[1]})...")
            prediction_result = active_detector.predict(pil_image)
            
            final_result = prediction_result.get("result")
            if final_result not in ("AI", "REAL"):
                raise ValueError(f"Invalid model output: {final_result}")

            return jsonify({
                "result": final_result,
                "reason": prediction_result.get("reason"),
                "explanation": prediction_result.get("explanation"),
                "confidence": prediction_result.get("confidence"),
                "forensics": prediction_result.get("forensics"),
                "media_type": "image",
            }), 200

        except Exception as e:
            logger.error(f"Inference execution failure on file '{filename}': {e}", exc_info=True)
            return jsonify({
                "error": "An error occurred during AI analysis. Please try again."
            }), 500


@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": getattr(error, "description", "Bad Request")}), 400


@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "API endpoint not found"}), 404
    return render_template("index.html"), 200


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle payload exceeding MAX_CONTENT_LENGTH."""
    return jsonify({
        "error": "File size exceeds the allowable limit (32MB). Please upload a smaller image."
    }), 413


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "An internal server error occurred. Please try again later."}), 500


@app.errorhandler(Exception)
def unhandled_exception(error):
    logger.error(f"Unhandled exception on route {request.path}: {error}", exc_info=True)
    if request.path.startswith("/api/"):
        return jsonify({"error": "An unexpected server error occurred during processing."}), 500
    return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run AI TruthLens Server")
    parser.add_argument("--host", default=app.config["HOST"], help="Host to bind to")
    parser.add_argument("--port", type=int, default=app.config["PORT"], help="Port to bind to")
    args, _ = parser.parse_known_args()

    logger.info(f"Starting AI TruthLens server on {args.host}:{args.port}...")
    app.run(host=args.host, port=args.port, debug=app.config["DEBUG"], threaded=True)
