# API dev image — Django runserver with live reload via bind mount.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends gcc libpq-dev \
 && rm -rf /var/lib/apt/lists/*

COPY backend/requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/dev.txt

EXPOSE 8777

CMD sh -c "python manage.py migrate --noinput \
 && python manage.py seed_catalog \
 && python manage.py runserver 0.0.0.0:8777"
