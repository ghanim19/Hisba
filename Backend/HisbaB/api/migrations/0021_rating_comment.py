# Generated by Django 5.0.5 on 2024-06-08 15:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_rating_user_alter_rating_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='rating',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]