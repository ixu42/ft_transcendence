#!/bin/sh

while true; do
    echo "Waiting PostgreSQL..."
    nc -z -w 1 $POSTGRES_HOST $POSTGRES_PORT
    [ $? -ne 0 ] || break
    sleep 1
done

echo "PostgreSQL is ready..."

python3 manage.py makemigrations
python3 manage.py migrate

python3 manage.py createsuperuser --no-input --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" || true

echo "Starting Django..."
exec python3 manage.py runserver 0.0.0.0:$DJANGO_PORT
