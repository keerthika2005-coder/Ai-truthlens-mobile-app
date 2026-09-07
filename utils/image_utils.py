"""Image processing and validation utilities for AI TruthLens."""
import io
import os
import logging
from PIL import Image, UnidentifiedImageError
from werkzeug.utils import secure_filename

logger = logging.getLogger("TruthLens.ImageUtils")

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "avi", "mkv"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
}
MAX_FILE_SIZE_BYTES = 32 * 1024 * 1024  # 32MB limit


def allowed_file(filename: str) -> bool:
    """Check if the filename has an allowed extension (image or video)."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def is_image_file(filename: str) -> bool:
    """Check if the filename has an allowed image extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_IMAGE_EXTENSIONS


def is_video_file(filename: str) -> bool:
    """Check if the filename has an allowed video extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_VIDEO_EXTENSIONS


def get_safe_filename(filename: str) -> str:
    """Generate a sanitized safe filename."""
    base_name = secure_filename(filename)
    if not base_name:
        base_name = "upload_image"
    return base_name


def validate_and_open_image(file_stream_or_bytes) -> Image.Image:
    """
    Validates and safely opens an uploaded image using Pillow.
    
    Checks:
    - Non-empty byte stream
    - Valid image format
    - Not corrupted (via Image.verify)
    - Converted safely to RGB
    
    Returns:
        PIL.Image.Image in RGB mode
    
    Raises:
        ValueError with a friendly error message if validation fails.
    """
    if file_stream_or_bytes is None:
        raise ValueError("No image data provided.")

    if hasattr(file_stream_or_bytes, "read"):
        raw_bytes = file_stream_or_bytes.read()
    elif isinstance(file_stream_or_bytes, (bytes, bytearray)):
        raw_bytes = file_stream_or_bytes
    else:
        raise ValueError("Invalid image input type.")

    if not raw_bytes or len(raw_bytes) == 0:
        raise ValueError("The uploaded image file is empty.")

    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError("Image file size exceeds the 10MB limit. Please upload a smaller image.")

    # Check image validity by attempting to open and verify
    try:
        # First verification pass
        verify_buffer = io.BytesIO(raw_bytes)
        with Image.open(verify_buffer) as test_img:
            img_format = (test_img.format or "").lower()
            valid_formats = {"jpeg", "png", "webp"}
            if img_format not in valid_formats:
                raise ValueError(f"Unsupported image format: '{img_format.upper()}'. Supported formats: JPG, PNG, WEBP.")
            test_img.verify()
    except (UnidentifiedImageError, OSError, SyntaxError) as e:
        logger.warning(f"Corrupted or unrecognized image uploaded: {e}")
        raise ValueError("The uploaded file is corrupted or not a valid image. Please try another file.")

    # Second load pass to obtain full image pixel data
    try:
        load_buffer = io.BytesIO(raw_bytes)
        img = Image.open(load_buffer)
        img.load()  # Force reading pixel data into memory
        
        # Verify minimum dimensions
        if img.width < 16 or img.height < 16:
            raise ValueError("Image resolution is too small to analyze. Minimum size is 16x16 pixels.")

        # Capture original info and EXIF before color mode conversions
        original_info = dict(img.info) if hasattr(img, "info") and img.info else {}
        original_exif = None
        try:
            original_exif = img.getexif()
        except Exception:
            pass

        # Convert to RGB if needed (handling RGBA, Grayscale, CMYK, Palette)
        if img.mode != "RGB":
            # For RGBA or palette with transparency, composite onto white background
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                rgba = img.convert("RGBA")
                background = Image.new("RGB", rgba.size, (255, 255, 255))
                background.paste(rgba, mask=rgba.split()[3])
                img = background
            else:
                img = img.convert("RGB")

        # Re-attach preserved metadata onto the returned RGB image
        if original_info:
            img.info = original_info
        if original_exif:
            img._original_exif = original_exif
        
        return img
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        raise ValueError("Could not decode image data. Please verify the file is a valid image.")


def cleanup_temp_file(file_path: str):
    """Safely delete a temporary file if it exists."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
            logger.debug(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Could not remove temporary file {file_path}: {e}")
