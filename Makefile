

all: help

help:
	@echo "Makefile for managing Docker Compose services"
	@echo ""
	@echo "Usage:"
	@echo "  make up        - Build and start the containers in detached mode"
	@echo "  make down      - Stop and remove the containers"
	@echo "  make start     - Start existing containers"
	@echo "  make stop      - Stop the containers"
	@echo "  make restart   - Restart the containers"
	@echo "  make build     - Build or rebuild services"
	@echo "  make rebuild   - Rebuild and start services"
	@echo "  make clean     - Remove containers, networks, images, and volumes"
	@echo "  make logs      - Follow logs of all services"
	@echo "  make ps        - List containers"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

rebuild: build up

clean:
	docker compose down -v --rmi all --remove-orphans

logs:
	docker compose logs --follow

ps:
	docker compose ps -a

.PHONY: help up down start stop restart build rebuild clean logs ps
