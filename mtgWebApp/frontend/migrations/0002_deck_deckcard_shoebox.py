# Generated by Django 2.0.3 on 2018-03-27 19:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('frontend', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Deck',
            fields=[
                ('deck', models.AutoField(primary_key=True, serialize=False)),
                ('deck_name', models.CharField(max_length=30)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='DeckCard',
            fields=[
                ('dc', models.AutoField(primary_key=True, serialize=False)),
                ('card', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frontend.CardTable')),
                ('deck', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frontend.Deck')),
            ],
        ),
        migrations.CreateModel(
            name='ShoeBox',
            fields=[
                ('sbox', models.AutoField(primary_key=True, serialize=False)),
                ('card', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='frontend.CardTable')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
