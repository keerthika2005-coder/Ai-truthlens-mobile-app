"""
AI TruthLens Desktop Launcher
Launches the Flask backend server in a background thread and presents
the UI in a dedicated native desktop window using pywebview.
"""

import sys
import os
import time
import socket
import threading
import urllib.request

# Ensure the project root directory is in sys.path
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from app import app


def find_free_port(default_port=3000):
    """Find an available port on localhost, falling back to dynamic port if 3000 is occupied."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', default_port))
            return default_port
    except OSError:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', 0))
            return s.getsockname()[1]


def wait_for_server(port, timeout=15):
    """Wait until Flask responds to HTTP requests."""
    start_time = time.time()
    url = f"http://127.0.0.1:{port}/api/health"
    while time.time() - start_time < timeout:
        try:
            with urllib.request.urlopen(url, timeout=1) as response:
                if response.status == 200:
                    return True
        except Exception:
            time.sleep(0.2)
    return False


def run_server(port):
    """Run Flask with debug disabled for desktop stability."""
    import logging
    # Suppress verbose request logs in the desktop console
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)


def main():
    try:
        import webview
    except ImportError:
        print("[!] pywebview is not installed.")
        print("    Please install it by running: pip install pywebview")
        sys.exit(1)

    port = find_free_port(3000)

    # Start Flask server thread
    server_thread = threading.Thread(target=run_server, args=(port,), daemon=True)
    server_thread.start()

    # Wait for the server to be responsive
    wait_for_server(port, timeout=10)

    target_url = f"http://127.0.0.1:{port}"

    # Create the native desktop window
    window = webview.create_window(
        title="AI TruthLens - Deepfake & Synthetic Media Detector",
        url=target_url,
        width=1280,
        height=850,
        min_size=(900, 600),
        text_select=True,
        zoomable=True
    )

    # Start the desktop window event loop
    webview.start(debug=False)


if __name__ == "__main__":
    main()
