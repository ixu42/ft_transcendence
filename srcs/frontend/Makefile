APP_DIR = app
PORT = 8080

all: debug

debug:
	@echo "Starting the debug server..."
	cd $(APP_DIR) && python3 -m http.server $(PORT)

prod:
	@echo "Starting the app in production mode..."
	cd $(APP_DIR) && python3 -m http.server $(PORT)

.PHONY: all debug prod
