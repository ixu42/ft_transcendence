APP_DIR = app
PORT = 8080

all: debug

debug:
	@echo "Starting the development server on http://localhost:$(PORT)..."
	cd $(APP_DIR) && python3 -m http.server $(PORT)

prod:
	@echo "Starting the production server on http://0.0.0.0:$(PORT)..."
	cd $(APP_DIR) && python3 -m http.server $(PORT) --bind 0.0.0.0

stop:
	@echo "Stopping the server (use Ctrl+C)."

.PHONY: all debug prod stop
