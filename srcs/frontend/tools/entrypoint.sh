#!/bin/sh

# Wait for the backend to be available
echo "Waiting for backend to be available at tr_back:8000..."

while ! nc -z tr_back 8000; do
  sleep 2
done

echo "Backend is up!"

# Verifies if certificate and key exist; create them if they are missing.
if [ ! -f "/app/tools/ssl/nginx.crt" ] || [ ! -f "/app/tools/ssl/nginx.key" ]; then
    echo "SSL certificate or key not found. Generating new certificate..."
    mkdir -p /app/tools/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /app/tools/ssl/nginx.key \
        -out /app/tools/ssl/nginx.crt \
        -subj "/C=FI/L=Helsinki/O=Hive/CN=pong.42.fr"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to generate SSL certificate. Exiting."
        exit 1
    fi
    echo "SSL certificate and key successfully generated."
fi

# Substitute NGINX_PORT and DJANGO_PORT in config file with port numbers
envsubst '$NGINX_PORT $DJANGO_PORT' < tools/nginx.conf > /etc/nginx/conf.d/default.conf

echo "Starting NGINX..."
exec nginx -g "daemon off;"
