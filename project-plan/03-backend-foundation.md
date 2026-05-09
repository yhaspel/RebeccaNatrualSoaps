# 03 — Backend Foundation (Django + JWT)

## Deliverables
- `backend/` Django project created with `django-admin startproject config`.
- Split settings: `config/settings/{base.py,dev.py,prod.py}`.
- Apps scaffolded: `users`, `catalog`, `orders`, `contact`.
- DRF + SimpleJWT + CORS configured.
- Custom user model **created before the first migration**.

## User model
```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_store_admin = models.BooleanField(default=False)
    preferred_language = models.CharField(
        max_length=5, choices=[('en', 'English'), ('he', 'Hebrew')], default='en'
    )
```
Set `AUTH_USER_MODEL = 'users.User'` in `base.py`.

## Auth routes
- `POST /api/auth/register/` — create account
- `POST /api/auth/login/` — SimpleJWT token pair
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/` — blacklist refresh token
- `GET  /api/auth/me/` — current user
- `POST /api/auth/admin-login/` — same as login but rejects non-admins early with 403

## Admin authorization
`IsStoreAdmin` DRF permission:
```python
class IsStoreAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_store_admin)
```

## Pre-seeded admin
Data migration or management command that creates `rebecca` /
password from env (default `ChangeMe!123`) with `is_store_admin=True`.
