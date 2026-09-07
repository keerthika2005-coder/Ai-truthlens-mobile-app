"""Video processing and frame extraction utilities for AI TruthLens."""
import os
import io
import json
import base64
import tempfile
import logging
import subprocess
from typing import List, Dict, Any, Tuple
from PIL import Image

logger = logging.getLogger("ai_truthlens.video_utils")

ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "avi", "mkv"}


def is_video_filename(filename: str) -> bool:
    """Check if filename has a supported video extension."""
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_VIDEO_EXTENSIONS


def probe_video_metadata(video_path: str) -> Dict[str, Any]:
    """
    Runs ffprobe to inspect video duration, resolution, and streams.
    Returns metadata dict or raises ValueError if invalid video.
    """
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration,size:stream=width,height,codec_name,r_frame_rate,nb_frames",
        "-of", "json",
        video_path
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
        if res.returncode != 0:
            raise ValueError(f"ffprobe failed: {res.stderr.strip()}")
        
        info = json.loads(res.stdout)
        streams = info.get("streams", [])
        video_streams = [s for s in streams if s.get("width") and s.get("height")]
        if not video_streams:
            raise ValueError("No video stream found in uploaded file.")
        
        vstream = video_streams[0]
        duration_str = info.get("format", {}).get("duration", "0")
        try:
            duration = float(duration_str)
        except (ValueError, TypeError):
            duration = 1.0

        width = int(vstream.get("width", 0))
        height = int(vstream.get("height", 0))

        return {
            "duration": max(duration, 0.1),
            "width": width,
            "height": height,
            "codec": vstream.get("codec_name", "unknown")
        }
    except subprocess.TimeoutExpired:
        raise ValueError("Video inspection timed out.")
    except Exception as e:
        logger.error(f"Error probing video {video_path}: {e}")
        raise ValueError(f"Unable to decode video: {e}")


def extract_video_keyframes(video_path: str, max_frames: int = 6) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Extracts up to max_frames evenly distributed keyframes across the video duration.
    Returns (video_metadata, list of frame dicts with PIL Image, timestamp, thumbnail base64).
    """
    meta = probe_video_metadata(video_path)
    duration = meta["duration"]
    
    # Calculate timestamps evenly across the duration (avoiding absolute 0.0s edge if possible)
    if duration <= 1.0:
        timestamps = [round(duration * 0.5, 2)]
    elif duration <= 2.5:
        timestamps = [round(duration * 0.25, 2), round(duration * 0.75, 2), round(duration * 0.95, 2)]
    else:
        # Spread max_frames between 5% and 95% of duration
        step = (duration * 0.90) / max(max_frames - 1, 1)
        timestamps = [round(0.05 * duration + i * step, 2) for i in range(max_frames)]
        timestamps = [min(ts, duration - 0.05) for ts in timestamps]

    extracted_frames = []

    for idx, ts in enumerate(timestamps):
        cmd = [
            "ffmpeg", "-ss", str(ts),
            "-i", video_path,
            "-vframes", "1",
            "-f", "image2pipe",
            "-vcodec", "png",
            "-"
        ]
        try:
            proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            out_bytes, _ = proc.communicate(timeout=8)
            if out_bytes and len(out_bytes) > 100:
                img = Image.open(io.BytesIO(out_bytes)).convert("RGB")
                
                # Create a small lightweight base64 thumbnail for UI timeline
                thumb = img.copy()
                thumb.thumbnail((160, 120))
                thumb_buf = io.BytesIO()
                thumb.save(thumb_buf, format="JPEG", quality=75)
                thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_buf.getvalue()).decode("utf-8")
                
                extracted_frames.append({
                    "frame_index": idx + 1,
                    "timestamp_sec": ts,
                    "timestamp_formatted": f"{ts:.1f}s",
                    "image": img,
                    "thumbnail": thumb_b64
                })
        except Exception as e:
            logger.warning(f"Failed to extract frame at timestamp {ts}s: {e}")

    if not extracted_frames:
        raise ValueError("Could not extract any playable frames from the video.")

    return meta, extracted_frames
