# Generated by Django 2.0.3 on 2018-03-30 04:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('frontend', '0004_auto_20180329_1315'),
    ]

    operations = [
        migrations.RenameField(
            model_name='deck',
            old_name='deck',
            new_name='deck_id',
        ),
        migrations.RenameField(
            model_name='deckcard',
            old_name='dc',
            new_name='dc_id',
        ),
        migrations.RenameField(
            model_name='shoebox',
            old_name='sbox',
            new_name='sbox_id',
        ),
    ]
