"""Production settings — Railway / generic PaaS friendly."""
import dj_database_url
from decouple import Csv, config

from .base import *  # noqa: F401,F403

DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv(), default="")

DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
    )
}

MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  # noqa: F405
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Railway terminates TLS at its edge. Never redirect inside the app —
# you'll loop. The proxy header tells Django the original scheme so
# request.is_secure() still returns True.
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Railway exposes the API service's public hostname as
# RAILWAY_PUBLIC_DOMAIN (no scheme). FRONTEND_URL is the full
# https://... URL of the Web service, set as a service variable.
_railway_domain = config("RAILWAY_PUBLIC_DOMAIN", default="")
_frontend_url = config("FRONTEND_URL", default="").rstrip("/")

CSRF_TRUSTED_ORIGINS = [
    origin for origin in [
        _frontend_url,
        f"https://{_railway_domain}" if _railway_domain else "",
    ] if origin
]
CORS_ALLOWED_ORIGINS = [_frontend_url] if _frontend_url else []
