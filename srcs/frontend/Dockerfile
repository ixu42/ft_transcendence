FROM nginx:1.27.4-alpine-slim

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openssl \
    git \
    g++ \
    libtool \
    m4 \
    automake \
    autoconf \
    pcre \
    pcre-dev \
    make \
    linux-headers

ADD https://github.com/owasp-modsecurity/ModSecurity/releases/download/v3.0.14/modsecurity-v3.0.14.tar.gz .
COPY tools/install.sh .
RUN /install.sh

ENTRYPOINT [ "sh", "app/tools/entrypoint.sh" ]