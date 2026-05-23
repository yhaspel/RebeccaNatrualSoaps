"""Create or update a store-admin user with a given password. Idempotent."""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create or update a store-admin user with the given password."

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--email", default="")
        parser.add_argument("--first-name", default="")

    def handle(self, *args, **opts):
        user, created = User.objects.get_or_create(
            username=opts["username"],
            defaults={
                "email": opts["email"],
                "first_name": opts["first_name"],
            },
        )
        user.is_store_admin = True
        user.is_active = True
        user.set_password(opts["password"])
        user.save()
        self.stdout.write(self.style.SUCCESS(
            f"{'Created' if created else 'Updated'} admin: {user.username}"
        ))
