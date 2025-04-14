#!/bin/sh

while true; do
    echo "Waiting PostgreSQL..."
    nc -z -w 1 $POSTGRES_HOST $POSTGRES_PORT
    [ $? -ne 0 ] || break
    sleep 1
done

echo "PostgreSQL is ready..."

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
  secret_json=$(curl --silent --location "https://api.cloud.hashicorp.com/secrets/2023-11-28/organizations/b463ef9f-c30e-4039-adf0-1569d7092fc2/projects/b9f72685-9b8f-4733-af42-0883aac1c93f/apps/poggers/secrets:open" \
    --request GET \
    --header "Authorization: Bearer $HCP_API_TOKEN")

  # Use jq to filter for the secret matching the given name and extract its value
  local secret_value
  secret_value=$(echo "$secret_json" | jq -r --arg name "$secret_name" '.secrets[] | select(.name == $name) | .static_version.value')

  export "$secret_name"="$secret_value"
}

get_secret DJANGO_SUPERUSER_USERNAME
get_secret DJANGO_SUPERUSER_EMAIL
get_secret DJANGO_SUPERUSER_PASSWORD
get_secret SECRET_KEY


python3 manage.py makemigrations
python3 manage.py migrate

python3 manage.py createsuperuser --no-input --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" || true

echo "Starting Django..."
exec python3 manage.py runserver 0.0.0.0:$DJANGO_PORT
