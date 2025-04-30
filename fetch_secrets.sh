#!/bin/bash
source .hashicorp

# Authenticate and get HCP API Token
HCP_API_TOKEN=$(curl --silent --location "https://auth.idp.hashicorp.com/oauth2/token" \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "client_id=$HCP_CLIENT_ID" \
  --data-urlencode "client_secret=$HCP_CLIENT_SECRET" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "audience=https://api.hashicorp.cloud" | jq -r .access_token)

# Fetch secrets (assumes all secrets are at one version and single secret store)
RESPONSE=$(curl --silent --location  \
  --location "https://api.cloud.hashicorp.com/secrets/2023-11-28/organizations/b463ef9f-c30e-4039-adf0-1569d7092fc2/projects/b9f72685-9b8f-4733-af42-0883aac1c93f/apps/poggers/secrets:open" \
  --request GET \
  --header "Authorization: Bearer $HCP_API_TOKEN")

echo "$RESPONSE" | jq -r '.secrets[] | "\(.name)=\(.static_version.value)"' >> .env

