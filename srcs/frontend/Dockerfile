FROM nginx:1.27.4-alpine-slim

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openssl


# ENTRYPOINT ["sh"]
ENTRYPOINT [ "sh", "tools/entrypoint.sh" ]