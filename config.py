import os

class Config:
    """Application configuration for AI TruthLens."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "ai-truthlens-secure-key-2026")
    
    # Upload settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32 MB limit aligned with Nginx reverse proxy
    ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "avi", "mkv"}
    ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
    MAX_VIDEO_FRAMES_SAMPLE = 6
    
    # Model settings
    # dima806/ai_vs_real_image_detection: ViT fine-tuned for AI vs Real classification
    # id2label: {0: 'REAL', 1: 'FAKE'} -> mapped to REAL and AI
    MODEL_NAME = os.environ.get("MODEL_NAME", "dima806/ai_vs_real_image_detection")
    
    # Server settings
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", 3000))
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"
