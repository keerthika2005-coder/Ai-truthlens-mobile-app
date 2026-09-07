"""Tests for TruthLensDetector service."""
import pytest
from PIL import Image
from services.detector import TruthLensDetector


@pytest.fixture(scope="module")
def detector():
    """Shared detector fixture to avoid reloading weights across tests."""
    return TruthLensDetector()


def test_detector_initialization(detector):
    """Verify detector and processor are loaded and mapped properly."""
    assert detector is not None
    assert detector.model is not None
    assert detector.processor is not None
    assert len(detector.label_mapping) > 0


def test_detector_predict_contract(detector):
    """Verify inference returns valid dictionary adhering to strict contract."""
    test_img = Image.new("RGB", (224, 224), color=(140, 180, 210))
    result = detector.predict(test_img)

    assert isinstance(result, dict)
    assert "result" in result
    assert "reason" in result
    assert result["result"] in ("AI", "REAL")
    assert isinstance(result["reason"], str)
    assert len(result["reason"]) > 10


def test_detector_reasons_match_label(detector):
    """Verify appropriate explanation text is mapped to each verdict."""
    test_img = Image.new("RGB", (224, 224), color=(30, 30, 30))
    res = detector.predict(test_img)
    if res["result"] == "AI":
        assert res["reason"] == TruthLensDetector.REASON_AI
    else:
        assert res["reason"] == TruthLensDetector.REASON_REAL


def test_detector_invalid_input_type(detector):
    """Verify ValueError is raised if non-PIL object is passed."""
    with pytest.raises(ValueError):
        detector.predict("not an image")


def test_detector_forensic_fields_present(detector):
    """Verify inference returns rich forensic fields and explanations."""
    test_img = Image.new("RGB", (224, 224), color=(120, 140, 160))
    result = detector.predict(test_img)

    assert "explanation" in result
    assert "confidence" in result
    assert "forensics" in result
    assert isinstance(result["explanation"], str)
    assert len(result["explanation"]) > 20
    assert 0 <= result["confidence"] <= 100
    assert "noise_status" in result["forensics"]
    assert "compression_status" in result["forensics"]


def test_detector_real_camera_metadata(detector):
    """Verify an image with authentic camera metadata is accurately verified as REAL."""
    test_img = Image.new("RGB", (224, 224), color=(100, 120, 140))
    test_img._truthlens_metadata = {
        "camera_make": "Apple",
        "camera_model": "iPhone 14 Pro",
        "f_number": "1.8",
        "exposure_time": "1/120",
        "iso": "64",
        "ai_software_detected": False,
        "ai_parameters_detected": False
    }
    result = detector.predict(test_img)

    assert result["result"] == "REAL"
    assert "Apple" in result["explanation"]
    assert result["confidence"] >= 90.0


def test_detector_ai_synthesis_metadata(detector):
    """Verify an image with synthetic AI generator markers is accurately identified as AI."""
    test_img = Image.new("RGB", (224, 224), color=(100, 120, 140))
    test_img.info = {"parameters": "masterpiece, 8k photo, photorealistic, steps: 30"}
    result = detector.predict(test_img)

    assert result["result"] == "AI"
    assert "AI-Generated" in result["explanation"] or "synthesis" in result["explanation"].lower()
    assert result["confidence"] >= 90.0

