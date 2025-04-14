FROM nginx:1.27.4-alpine-slim

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openssl \
    openssl-dev \
    git \
    g++ \
    libtool \
    m4 \
    automake \
    autoconf \
    pcre \
    pcre-dev \
    make \
    linux-headers \
    zlib-dev

ADD https://github.com/owasp-modsecurity/ModSecurity/releases/download/v3.0.14/modsecurity-v3.0.14.tar.gz modsecurity.tar.gz
ADD https://nginx.org/download/nginx-1.27.4.tar.gz nginx.tar.gz
COPY tools/install.sh .
RUN /install.sh
COPY tools/crs-setup.conf /etc/nginx/modsecurity/coreruleset

WORKDIR /app

ENTRYPOINT [ "sh", "tools/entrypoint.sh" ]