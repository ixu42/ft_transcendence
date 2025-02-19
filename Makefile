
up:
	docker compose up -d --build

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

superuser:
	docker exec -it tr_back python manage.py createsuperuser

.PHONY: up down restart build rebuild clean logs ps superuser
