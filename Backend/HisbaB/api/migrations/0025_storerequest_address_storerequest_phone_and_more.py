# Generated by Django 5.0.5 on 2024-06-12 19:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_storerequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='storerequest',
            name='address',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='storerequest',
            name='phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='storerequest',
            name='store_type',
            field=models.CharField(blank=True, choices=[('Farm', 'Farm'), ('Manufacturing', 'Manufacturing')], max_length=100, null=True),
        ),
    ]