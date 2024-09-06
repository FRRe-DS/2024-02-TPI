# Generated by Django 5.1 on 2024-09-06 19:50

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("app", "0007_delete_usercustom"),
    ]

    operations = [
        migrations.AlterField(
            model_name="visitante",
            name="correo",
            field=models.EmailField(
                default=django.utils.timezone.now, max_length=254, unique=True
            ),
            preserve_default=False,
        ),
    ]
