# 24 — Local Dev & Deployment

## Local dev (no Docker)
```bash
# One time
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
export DJANGO_SETTINGS_MODULE=config.settings.dev
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver 8777

# Another terminal
cd frontend
npm install
npm start     # http://localhost:4333
```

Angular `environment.ts` points `apiUrl` at `http://localhost:8777/api`.

## Environment variables
| Var                       | Dev default                  | Prod |
|---------------------------|------------------------------|------|
| `SECRET_KEY`              | `insecure-dev-key-…`         | required |
| `DJANGO_SETTINGS_MODULE`  | `config.settings.dev`        | `config.settings.prod` |
| `GROW_API_KEY`            | unset → mock provider        | required for real payments |
| `GROW_PAGE_CODE`          | unset → frontend uses mock   | required |
| `ALLOWED_HOSTS`           | `localhost,127.0.0.1`        | `rebeccasnaturalsoaps.com,…` |
| `CORS_ALLOWED_ORIGINS`    | `http://localhost:4333`      | `https://rebeccasnaturalsoaps.com` |

## Deployment
Out of scope for the MVP, but the skeleton is ready for Railway: backend
Dockerfile + nginx serving the Angular build, Postgres via `dj-database-url`,
whitenoise for Django static. See the `railway-deployment` skill when we go
live.
