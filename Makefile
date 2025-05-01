up: .env
	docker compose up --build -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build --no-cache --parallel

rebuild: build up

clean:
	docker compose down -v --rmi all --remove-orphans
#	rm .env

logs:
	docker compose logs --follow

ps:
	docker compose ps -a

superuser:
	docker exec -it tr_back python manage.py createsuperuser

.env: fetch_secrets.sh
	@./fetch_secrets.sh

.PHONY: up down restart build rebuild clean logs ps superuser
