from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Rebecca's Natural Soaps custom user.

    `is_store_admin` gates access to the Angular-side admin UI at /admin.
    `preferred_language` lets the UI default to the user's language on login.
    """

    LANGUAGE_CHOICES = (
        ("en", "English"),
        ("he", "Hebrew"),
    )

    email = models.EmailField(unique=True)
    is_store_admin = models.BooleanField(default=False)
    preferred_language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default="en",
    )

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.username
