# API service — Django 5 + Gunicorn for Railway.
# Built from the repo root: `docker build -f docker/api.Dockerfile .`
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# psycopg2-binary needs libpq; gcc helps with any wheel fallbacks.
RUN apt-get update \
 && apt-get install -y --no-install-recommends gcc libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps first for layer caching.
COPY backend/requirements/base.txt requirements/base.txt
COPY backend/requirements/prod.txt requirements/prod.txt
RUN pip install --no-cache-dir -r requirements/prod.txt

# App code.
COPY backend/ .

ENV DJANGO_SETTINGS_MODULE=config.settings.prod

# Collect static at build time so WhiteNoise has a manifest to serve.
# A throwaway SECRET_KEY is fine here — it's overridden at runtime.
RUN SECRET_KEY=build-placeholder \
    DATABASE_URL=sqlite:///tmp/build.sqlite3 \
    ALLOWED_HOSTS=localhost \
    python manage.py collectstatic --noinput

EXPOSE 8000

# Migrate, seed (idempotent), then start Gunicorn.
# seed_catalog uses update_or_create — safe on every redeploy.
CMD python manage.py migrate --noinput \
 && python manage.py seed_catalog \
 && gunicorn config.wsgi:application \
        --bind 0.0.0.0:${PORT:-8000} \
        --workers 3 \
        --timeout 120 \
        --access-logfile - \
        --error-logfile -
