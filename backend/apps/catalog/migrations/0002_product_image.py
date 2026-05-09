# Hand-written migration to add an ImageField for product images uploaded from
# the admin UI. The legacy `image_url` field stays — seeded products use it,
# and the serializer prefers `image` when present, falling back to `image_url`.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="products/"),
        ),
    ]
