"""Video inference and integration tests for AI TruthLens."""
import os
import io
import subprocess
import pytest
from app import app, detector_ready_event
from utils.video_utils import probe_video_metadata, extract_video_keyframes, is_video_filename
from services.detector import TruthLensDetector


@pytest.fixture(scope="session")
def client():
    app.config["TESTING"] = True
    detector_ready_event.wait(timeout=30)
    with app.test_client() as client:
        yield client


@pytest.fixture(scope="session")
def sample_video_path(tmp_path_factory):
    """Creates a small 1-second synthetic MP4 video using ffmpeg."""
    fn = tmp_path_factory.mktemp("video") / "test_clip.mp4"
    target_path = str(fn)
    subprocess.run([
        "ffmpeg", "-y", "-f", "lavfi",
        "-i", "testsrc=duration=1.5:size=320x240:rate=10",
        "-pix_fmt", "yuv420p", target_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return target_path


def test_is_video_filename():
    assert is_video_filename("clip.mp4") is True
    assert is_video_filename("movie.webm") is True
    assert is_video_filename("photo.jpg") is False
    assert is_video_filename("document.pdf") is False


def test_probe_video_metadata(sample_video_path):
    meta = probe_video_metadata(sample_video_path)
    assert meta["width"] == 320
    assert meta["height"] == 240
    assert meta["duration"] >= 1.0


def test_extract_video_keyframes(sample_video_path):
    meta, frames = extract_video_keyframes(sample_video_path, max_frames=3)
    assert len(frames) > 0
    assert "image" in frames[0]
    assert "thumbnail" in frames[0]
    assert frames[0]["thumbnail"].startswith("data:image/jpeg;base64,")


def test_analyze_video_endpoint(client, sample_video_path):
    """POST /api/analyze with video file returns 200 and video breakdown."""
    with open(sample_video_path, "rb") as f:
        data = {"video": (f, "test_clip.mp4")}
        response = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data["result"] in ("AI", "REAL")
    assert "reason" in res_data
    assert res_data["media_type"] == "video"
    assert "video_info" in res_data
    assert res_data["video_info"]["frames_analyzed"] > 0
    assert "frames" in res_data
    assert len(res_data["frames"]) > 0
