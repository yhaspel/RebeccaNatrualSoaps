# 26 — Railway Deployment (Chrome-MCP auto-complete setup)

This plan promotes the deploy notes from `24-local-dev-and-deploy.md` from "out of
scope" to a real, repeatable shipping path. The goal is a one-conversation deploy:
Claude drives the Railway dashboard end-to-end with the **Chrome MCP** while you watch,
push to `main`, and load the live URL.

> Reference skill: `railway-deployment`. This plan inherits its three-service shape,
> Dockerfile templates, prod settings, and gotchas — and pins them to the
> Rebecca's monorepo (`backend/`, `frontend/`, Angular dist at
> `frontend/dist/rns/browser/`, Django settings at `config.settings.prod`,
> seed command `seed_catalog`).

## Architecture

Three services in one Railway project, same shape as the skill:

| Service     | Role                       | Builder                    |
|-------------|----------------------------|----------------------------|
| **API**     | Django 5 + Gunicorn        | `docker/api.Dockerfile`    |
| **Web**     | Angular 19 build + nginx   | `docker/web.Dockerfile`    |
| **Postgres**| Managed database           | Railway native             |

Public traffic hits **Web**. nginx serves the Angular SPA and proxies `/api/*` to **API**.
Postgres is referenced from the API service via `${{Postgres.DATABASE_URL}}`.

## Files added to the repo (one-time, hand-written)

```
docker/
├── api.Dockerfile       # Python 3.11-slim → Gunicorn on $PORT
├── web.Dockerfile       # node:22-alpine build → nginx:1.27-alpine
└── nginx.conf           # /, /health, /api/ proxy, SPA try_files

backend/
├── requirements/prod.txt    # adds: gunicorn, psycopg2-binary, dj-database-url, whitenoise
└── config/settings/prod.py  # see "Django prod settings" below
```

The Dockerfiles match the skill verbatim with two project-specific edits:

1. **Web Dockerfile** copies `frontend/dist/rns/browser` → `/usr/share/nginx/html`
   (the dist path is `dist/rns/browser/` per `frontend/angular.json` /
   `frontend/dist/rns/browser/index.html`).
2. **API Dockerfile** runs `python manage.py seed_catalog` after `migrate --noinput`
   so a fresh Postgres comes up with the 12 soaps + 4 categories from
   `08-seed-data.md`. Make `seed_catalog` idempotent (`get_or_create`) before
   shipping — the CMD will run on every redeploy.

## Django prod settings

`backend/config/settings/prod.py` extends `base.py` with:

```python
import os, dj_database_url
from .base import *  # noqa

DEBUG = False
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ["DATABASE_URL"], conn_max_age=600
    )
}

# Railway terminates TLS — never redirect internally or you get loops
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

_railway = os.environ.get("RAILWAY_PUBLIC_DOMAIN", "")
_frontend = os.environ.get("FRONTEND_URL", "")
CSRF_TRUSTED_ORIGINS = [u for u in [_frontend, f"https://{_railway}" if _railway else ""] if u]
CORS_ALLOWED_ORIGINS = [_frontend] if _frontend else []

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
```

Add a `/api/health/` view in `apps.users` (or `apps.catalog`) that returns
`{"status": "ok"}` — needed for the verification step below.

## Environment variables

Building on the table in `24-local-dev-and-deploy.md`:

### API service

| Var                       | Value                                                    |
|---------------------------|----------------------------------------------------------|
| `DJANGO_SETTINGS_MODULE`  | `config.settings.prod`                                   |
| `SECRET_KEY`              | strong random (Claude generates one — never reused from dev) |
| `DATABASE_URL`            | `${{Postgres.DATABASE_URL}}`                             |
| `ALLOWED_HOSTS`           | `${{RAILWAY_PUBLIC_DOMAIN}},<web>.up.railway.app`        |
| `FRONTEND_URL`            | `https://<web>.up.railway.app`                           |
| `PORT`                    | `8000`                                                   |
| `GROW_API_KEY`            | real key once we go live; unset → mock provider          |
| `GROW_PAGE_CODE`          | real page code once we go live                           |

### Web service

| Var            | Value         |
|----------------|---------------|
| `BUILD_CONFIG` | `production`  |
| `PORT`         | `80`          |

The web domain is unknown until step 4, so `ALLOWED_HOSTS` and `FRONTEND_URL` are
filled in during step 5 (the API redeploys automatically when they change).

## Auto-complete setup via Chrome MCP

The dashboard work below is fully scriptable through the Chrome MCP
(`mcp__claude-in-chrome__*`). Railway's UI is a web app, so the MCP — DOM-aware,
much faster than pixel clicks — is the right tier here. Computer-use is not
needed.

**Why Chrome MCP, not computer-use:** Railway is a browser app, every control
has a stable accessible name (`New`, `Variables`, `Settings`, `Generate Domain`),
and we need to read live state (build logs, generated domains) back into later
steps. The MCP's `find` + `get_page_text` make that loop reliable; pixel
screenshots would not.

**Prereqs the user does once, manually** (Claude cannot do these — account/auth):
1. Install the Claude in Chrome extension if not already present.
2. Sign into [railway.com](https://railway.com) in the same Chrome profile.
3. Make sure the GitHub repo (`RebeccasNaturalSoaps`) is connected to Railway's
   GitHub integration with `main` accessible.

**What Claude does, in one go,** once the user says "deploy":

1. **Tab + navigate.** `tabs_create_mcp` → `navigate` to
   `https://railway.com/dashboard`. Confirm logged-in state via `get_page_text`.
2. **Create project.** `find` "New Project" → click → "Deploy from GitHub Repo"
   → select `RebeccasNaturalSoaps`. Read the auto-created service name back.
3. **Add Postgres.** `find` "+ New" inside the project canvas → "Database" →
   "PostgreSQL". Wait for provisioning by polling `get_page_text` for
   "Postgres".
4. **Configure API service.** Click the auto-created service → Settings →
   set Root Directory `/`, Builder = Dockerfile, Dockerfile Path
   `docker/api.Dockerfile`. Then Variables tab → bulk-paste the API env vars
   from the table above using the "Raw Editor" textarea (one MCP `form_input`
   call, not eight click+types). Generate `SECRET_KEY` client-side before
   pasting.
5. **Add Web service.** Project canvas → "+ New" → "GitHub Repo" → same repo →
   Settings → Dockerfile Path `docker/web.Dockerfile`, Builder = Dockerfile.
   Variables → `BUILD_CONFIG=production`, `PORT=80`.
6. **Generate Web domain.** Web service → Settings → Networking →
   "Generate Domain". Read the resulting `*.up.railway.app` URL out of the DOM.
7. **Backfill API vars.** Switch to API service → Variables → patch
   `ALLOWED_HOSTS` and `FRONTEND_URL` with the Web domain. Save → Railway
   triggers an automatic redeploy.
8. **Watch the deploys.** For each service, open Deployments → the latest
   deploy → poll the build log via `get_page_text` until status is
   "Success". Surface any error lines back to chat.
9. **Verify** (see next section). On any failure, drop back into the deploy log,
   classify against the gotchas table, and propose the fix.

The user only types two things during the whole run: their permission to start,
and any GROW production keys they want to set (if going live with real
payments).

## Verification

After step 8 the following four URLs must all succeed:

```
https://<web>.up.railway.app/health           → "ok"             (nginx)
https://<api>.up.railway.app/api/health/      → {"status":"ok"}  (Django direct)
https://<web>.up.railway.app/api/health/      → {"status":"ok"}  (proxy works)
https://<web>.up.railway.app/                 → home page renders, EN+HE both load
```

Then a smoke test of the real flows:

- `/products` shows all 12 soaps with images (this depends on `seed_catalog`
  having run — see gotcha #5).
- Add to cart → `/checkout` reaches the mock-card form (Grow keys unset → mock
  provider per `07-payments.md`).
- `/admin` login with the seeded admin user → products table loads.
- Toggle to Hebrew on the home page → layout flips RTL, copy is in Hebrew.

Claude executes these via Chrome MCP `navigate` + `get_page_text` and reports a
pass/fail line per step.

## Project-specific gotchas

The skill's gotcha table applies in full. The two that bite this project
specifically:

1. **Web Dockerfile dist path.** This monorepo's Angular project name is `rns`,
   so the build output is `frontend/dist/rns/browser/`, not the skill's
   placeholder `<your-app>`. The web Dockerfile must `COPY --from=build
   /app/dist/rns/browser /usr/share/nginx/html`.
2. **`seed_catalog` runs every deploy.** The skill's CMD pattern bakes
   `seed_<thing>` into the API container's CMD. If `seed_catalog` is not
   idempotent it will explode on the second deploy with a unique-constraint
   violation. Convert any `Product.objects.create(...)` calls in the seed
   command to `get_or_create` keyed on slug before the first deploy.

Plus the universal four to keep top-of-mind: `ALLOWED_HOSTS` must include the
**web** domain (nginx forwards the browser's `Host` header), `proxy_pass`
must use the **public** API URL not `*.railway.internal`, `CSRF_TRUSTED_ORIGINS`
needs the `https://` prefix, and never enable `SECURE_SSL_REDIRECT`.

## Out of scope (follow-ups, not blockers)

- Custom domain (`rebeccasnaturalsoaps.com`) — added in Networking once we have
  one, and appended to `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS`.
- Object storage for product images — current seed uses external URLs; once
  Rebecca uploads her own photos this moves to S3 / Railway volumes.
- Backups + monitoring — Railway's built-in Postgres backups are on by default;
  we'll add an uptime check before launch.
- Real Grow / Meshulam credentials — flipped on at the last moment so we don't
  charge real cards during smoke tests.

## Rollback

Railway keeps the previous deploy hot. If a release breaks production:

1. API or Web service → Deployments tab → previous successful deploy →
   "Redeploy". Claude can do this through the Chrome MCP in ~10 seconds.
2. If the breakage is a migration, `python manage.py migrate <app> <prev>`
   via Railway's "Run Command" before redeploying the old image.
