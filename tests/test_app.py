"""Integration and route tests for AI TruthLens Flask Application."""
import io
import pytest
from PIL import Image
from app import app, detector_ready_event


@pytest.fixture(scope="session")
def client():
    app.config["TESTING"] = True
    detector_ready_event.wait(timeout=30)
    with app.test_client() as client:
        yield client


def test_index_route(client):
    """GET / returns HTML landing page."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"AI TruthLens" in response.data
    assert b"See Beyond the Image" in response.data


def test_health_route(client):
    """GET /health returns JSON status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
    assert data["detector_ready"] is True


def test_analyze_missing_image_field(client):
    """POST /api/analyze without file part returns 400."""
    response = client.post("/api/analyze", data={})
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_analyze_empty_filename(client):
    """POST /api/analyze with empty filename returns 400."""
    data = {"image": (io.BytesIO(b""), "")}
    response = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    res_data = response.get_json()
    assert "error" in res_data


def test_analyze_disallowed_extension(client):
    """POST /api/analyze with invalid file extension returns 400."""
    data = {"image": (io.BytesIO(b"dummy text content"), "test.txt")}
    response = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    res_data = response.get_json()
    assert "error" in res_data
    assert "JPG" in res_data["error"]


def test_analyze_corrupted_image(client):
    """POST /api/analyze with corrupt byte payload returns 400."""
    data = {"image": (io.BytesIO(b"not-really-a-jpeg-header"), "fake.jpg")}
    response = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    assert response.status_code == 400
    res_data = response.get_json()
    assert "error" in res_data


def test_analyze_valid_image(client):
    """POST /api/analyze with valid JPEG runs real inference and returns 200."""
    # Create valid in-memory image
    img = Image.new("RGB", (224, 224), color=(80, 120, 160))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    data = {"image": (buf, "sample_real_photo.jpg")}
    response = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    assert response.status_code == 200
    res_data = response.get_json()
    assert "result" in res_data
    assert res_data["result"] in ("AI", "REAL")
    assert "reason" in res_data
    assert isinstance(res_data["reason"], str)
    assert "explanation" in res_data
    assert "confidence" in res_data
    assert "forensics" in res_data
    assert isinstance(res_data["explanation"], str)
    assert len(res_data["explanation"]) > 20

