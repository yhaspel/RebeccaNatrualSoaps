from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='order',
            old_name='stripe_payment_intent_id',
            new_name='grow_process_id',
        ),
        migrations.RenameField(
            model_name='order',
            old_name='stripe_client_secret',
            new_name='grow_process_token',
        ),
        migrations.AddField(
            model_name='order',
            name='grow_transaction_id',
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
