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

echo "Starting Django..."
exec python3 manage.py runserver 0.0.0.0:$DJANGO_PORT
