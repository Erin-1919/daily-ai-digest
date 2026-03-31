import os
import threading
import http.server
import socketserver
import webview

PORT = 0  # Let OS pick a free port
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
ICON_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'daily-ai-digest.ico')


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def log_message(self, format, *args):
        pass  # Suppress server logs


def start_server():
    httpd = socketserver.TCPServer(('127.0.0.1', PORT), QuietHandler)
    actual_port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return actual_port, httpd


if __name__ == '__main__':
    port, httpd = start_server()
    window = webview.create_window(
        'Daily AI Digest',
        f'http://127.0.0.1:{port}',
        width=1280,
        height=860,
        min_size=(600, 500),
    )
    webview.start()
    httpd.shutdown()
