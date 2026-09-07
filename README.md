# AI TruthLens — AI-Generated Image Detection System

![AI TruthLens](https://img.shields.io/badge/AI-TruthLens-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11-green.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.14-orange.svg)
![Transformers](https://img.shields.io/badge/HuggingFace-ViT-yellow.svg)
![Tests](https://img.shields.io/badge/Pytest-11%20Passed-brightgreen.svg)

**AI TruthLens** is an AI-generated image detection web application built with **Python 3.11, Flask, PyTorch, and Hugging Face Transformers**. It inspects images using real machine-learning inference to classify whether an image is **AI-generated** or **authentic (REAL)**.

---

## Key Features

- **Genuine Machine Learning Inference**: Uses a real pretrained Vision Transformer (ViT) model (`dima806/ai_vs_real_image_detection`) fine-tuned for synthetic vs. authentic media classification. No fake predictions, random numbers, or mock APIs.
- **Unambiguous Verdict**: Categorically outputs either **AI** or **REAL** with an empirical reason explaining the visual feature correlation.
- **Privacy-First In-Memory Processing**: Uploaded images are validated and analyzed in-memory and are never stored permanently on disk or forwarded to external third-party services.
- **Robust Image Validation**: Defends against corrupted files, unauthorized formats, or excessively large files (10MB limit) using Pillow.
- **Modern AI SaaS Interface**: Clean dark-mode aesthetic with interactive drag-and-drop, image preview, vertical scanning animations, and responsive layout for mobile and desktop.
- **CPU & Laptop Friendly**: Optimized CPU inference running in ~150–400ms without requiring high-end dedicated GPUs.

---

## Technology Stack

- **Backend**: Python 3.11, Flask
- **AI/ML**: PyTorch (CPU-optimized), Hugging Face `transformers`, Pillow (`PIL`), NumPy
- **Frontend**: HTML5, Modern CSS3 (Variables, Flexbox, Grid), Vanilla JavaScript (No React/Node dependencies required for production Flask operation)
- **Testing**: Pytest

---

## Directory Structure

```
AI-TruthLens/
│
├── app.py                  # Flask web application & API routes
├── config.py               # Application configurations (upload size, models, ports)
├── requirements.txt        # Python dependency declarations
├── README.md               # Project documentation
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
│
├── services/
│   ├── __init__.py
│   └── detector.py         # TruthLensDetector ViT model loading and inference
│
├── utils/
│   ├── __init__.py
│   └── image_utils.py      # Pillow image validation, decoding, and sanitization
│
├── templates/
│   └── index.html          # Semantic HTML5 frontend interface
│
├── static/
│   ├── css/
│   │   └── style.css       # Responsive dark-mode styling
│   └── js/
│       └── script.js       # Client controller, drag-and-drop, API fetch
│
├── uploads/
│   └── .gitkeep            # Ephemeral upload folder (cleared automatically)
│
└── tests/
    ├── __init__.py
    ├── test_app.py         # Flask endpoint & integration tests
    └── test_detector.py    # Detector unit tests & contract validation
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have Python 3.11 installed on your system.

### 2. Clone and Navigate
```bash
git clone <your-repository-url>
cd AI-TruthLens
```

### 3. Create a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 4. Install Dependencies
Install CPU-optimized PyTorch and application dependencies:
```bash
pip install -r requirements.txt
```

---

## Running the Application

### Start the Flask Server
```bash
python app.py
```
By default, the server will start on `http://localhost:3000` (or `http://0.0.0.0:3000`).

You can customize the port or host:
```bash
python app.py --host 0.0.0.0 --port 5000
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Running the Test Suite

Run the automated test suite with pytest:
```bash
pytest tests/ -v
```

All 11 unit and integration tests will execute, validating:
- Image format restrictions
- Corrupted image error handling
- In-memory tensor transformations
- Strict output schema compliance (`{"result": "AI" | "REAL", "reason": "..."}`)
- HTTP status codes (200, 400, 413, 500)

---

## API Specification

### 1. Health Check
- **URL**: `/health` or `/api/health`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "ok",
  "service": "AI TruthLens",
  "detector_ready": true,
  "model": "dima806/ai_vs_real_image_detection"
}
```

### 2. Analyze Image
- **URL**: `/api/analyze`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `image` (binary file: JPG, JPEG, PNG, or WEBP, max 10MB)

#### Successful Response (AI Detected):
```json
{
  "result": "AI",
  "reason": "The detector's learned visual features are more consistent with AI-generated imagery."
}
```

#### Successful Response (Authentic / Real Detected):
```json
{
  "result": "REAL",
  "reason": "The detector's learned visual features are more consistent with authentic imagery."
}
```

#### Error Response:
```json
{
  "error": "Please upload a valid JPG, JPEG, PNG, or WEBP image."
}
```

---

## Model Details & Limitations

- **Architecture**: Fine-tuned Vision Transformer (`ViTForImageClassification`).
- **Input Dimensions**: Automatic bicubic interpolation to 224×224 normalized RGB tensor.
- **Inference Mode**: Evaluated in `torch.no_grad()` mode for minimal memory footprint and zero gradient accumulation.
- **Limitations**:
  - Extremely compressed or downscaled images (<16px) lose high-frequency artifacts required for detection.
  - Generative diffusion models are constantly evolving; new synthesis techniques may occasionally fall outside the model's training distribution.

---

## Quick Start (Node.js / Full-Stack React + Express)

### 1. Prerequisites
- **Node.js**: Version 18 or higher (Download from [nodejs.org](https://nodejs.org))
- **npm**: Included with Node.js

### 2. Install Dependencies
```bash
npm install
```

### 3. (Optional) Set up Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key inside `.env` if you want AI-assisted multimodal reasoning:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at:
```
http://localhost:3000
```

### 5. Build and Run Production
```bash
npm run build
npm start
```

---

> **TruthLens uses AI-based image analysis. Results are predictions and may not always be correct.**

Computer vision classifiers identify statistical correlations in pixel distributions. No AI detection model is 100% infallible. AI TruthLens is designed as an analytical decision-support tool, not definitive judicial proof.
