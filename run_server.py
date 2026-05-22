import http.server
import socketserver
import sys
import webbrowser

PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

class MyHTTPServer(http.server.HTTPServer):
    def handle_error(self, request, client_address):
        print(f"Error serving client {client_address}", file=sys.stderr)

# Try to find a free port starting from 8080
for try_port in [8080, 8085, 8888, 9000, 9090]:
    try:
        server_address = ("127.0.0.1", try_port)
        httpd = MyHTTPServer(server_address, Handler)
        PORT = try_port
        break
    except Exception as e:
        print(f"Port {try_port} is busy or unavailable. Trying next...")
else:
    print("Error: Could not find any available ports.", file=sys.stderr)
    sys.exit(1)

print(f"Server successfully started on port {PORT}!")
print(f"URL: http://127.0.0.1:{PORT}/offline-portal.html")
sys.stdout.flush()

try:
    # Auto-open browser
    webbrowser.open(f"http://127.0.0.1:{PORT}/offline-portal.html")
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user.")
    sys.exit(0)
except Exception as e:
    print(f"Server error: {e}", file=sys.stderr)
    sys.exit(1)
