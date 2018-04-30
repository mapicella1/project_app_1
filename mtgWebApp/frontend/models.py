from django.db import models
from django.contrib.auth.models import User


class CardTable(models.Model):
    card_id = models.AutoField(primary_key=True)
    card_name = models.CharField(max_length=150, blank=True, null=True)
    mana_cost = models.CharField(max_length=90, blank=True, null=True)
    converted_mana_cost = models.CharField(max_length=3, blank=True, null=True)
    types = models.CharField(max_length=100, blank=True, null=True)
    subtypes = models.CharField(max_length=100, blank=True, null=True)
    card_text = models.TextField(blank=True, null=True)
    flavor_text = models.TextField(blank=True, null=True)
    watermark = models.CharField(max_length=50, blank=True, null=True)
    loyalty = models.CharField(max_length=3, blank=True, null=True)
    p = models.CharField(max_length=5, blank=True, null=True)
    t = models.CharField(max_length=6, blank=True, null=True)
    expansion = models.CharField(max_length=75, blank=True, null=True)
    rarity = models.CharField(max_length=15, blank=True, null=True)
    all_sets = models.TextField(blank=True, null=True)
    card_number = models.CharField(max_length=4, blank=True, null=True)
    artist = models.CharField(max_length=50, blank=True, null=True)
    trans_card = models.CharField(max_length=150, blank=True, null=True)
    other_sets = models.CharField(max_length=10, blank=True, null=True)
    color_indicator = models.CharField(max_length=30, blank=True, null=True)
    linked_card = models.CharField(max_length=50, blank=True, null=True)
    hand_life = models.CharField(max_length=50, blank=True, null=True)
    modern = models.CharField(max_length=12, blank=True, null=True)
    legacy = models.CharField(max_length=12, blank=True, null=True)
    vintage = models.CharField(max_length=12, blank=True, null=True)
    commander = models.CharField(max_length=12, blank=True, null=True)
    unsets = models.CharField(max_length=12, blank=True, null=True)
    standard = models.CharField(max_length=12, blank=True, null=True)

    # def __str__(self):
    #     return self.card_name

    class Meta:
        managed = False
        db_table = 'card_table'


class Deck(models.Model):
    deck_id = models.AutoField(primary_key=True)
    deck_name = models.CharField(max_length=30)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deckUser')


class DeckCard(models.Model):
    dc_id = models.AutoField(primary_key=True)
    quantity = models.PositiveSmallIntegerField(default=1)
    card = models.ForeignKey(CardTable, on_delete=models.CASCADE, related_name='deckCard')
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='deckDeck')


class ShoeBox(models.Model):
    sbox_id = models.AutoField(primary_key=True)
    card = models.ForeignKey(CardTable, on_delete=models.CASCADE, related_name='shoeCard')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shoeUser')


