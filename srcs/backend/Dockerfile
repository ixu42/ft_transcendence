FROM python:3.13-slim

# Force the stdout and stderr streams to be unbuffered
ENV PYTHONUNBUFFERED=1
# Python won’t try to write .pyc files on the import of source modules.
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y \
    libpq-dev \
    curl \
    gcc \
    netcat-openbsd && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

COPY tools/requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm requirements.txt

ENTRYPOINT [ "sh", "tools/entrypoint.sh" ]
