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

#Generate API Token
HCP_API_TOKEN=$(curl --location "https://auth.idp.hashicorp.com/oauth2/token" \
--header "Content-Type: application/x-www-form-urlencoded" \
--data-urlencode "client_id=$HCP_CLIENT_ID" \
--data-urlencode "client_secret=$HCP_CLIENT_SECRET" \
--data-urlencode "grant_type=client_credentials" \
--data-urlencode "audience=https://api.hashicorp.cloud" | jq -r .access_token)

get_secret() {

  local secret_name="$1"

  local secret_json
  secret_json=$(curl --silent --location "https://api.cloud.hashicorp.com/secrets/2023-11-28/organizations/b463ef9f-c30e-4039-adf0-1569d7092fc2/projects/b9f72685-9b8f-4733-af42-0883aac1c93f/apps/sample-app/secrets:open" \
    --request GET \
    --header "Authorization: Bearer $HCP_API_TOKEN")

  # Use jq to filter for the secret matching the given name and extract its value
  local secret_value
  secret_value=$(echo "$secret_json" | jq -r --arg name "$secret_name" '.secrets[] | select(.name == $name) | .static_version.value')

  export "$secret_name"="$secret_value"
}

get_secret NGINX_PORT
get_secret DJANGO_PORT


# Substitute NGINX_PORT and DJANGO_PORT in config file with port numbers
envsubst '$NGINX_PORT $DJANGO_PORT' < tools/nginx.conf > /etc/nginx/nginx.conf

echo "Starting NGINX..."
exec nginx -g "daemon off;"
