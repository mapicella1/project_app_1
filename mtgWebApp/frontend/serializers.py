from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = '__all__'


class CardIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = 'card_id'


class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = '__all__'


class DeckCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeckCard
        fields = '__all__'


class ShoeBoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoeBox
        fields = ('card_id',)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username',)


class CardIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('card_id',)


class CardNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('card_name',)


class CardTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('types',)


class CardSubSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('subtypes',)


class CardExpSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('expansion',)


class CardSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = CardTable
        fields = ('card_id', 'card_name', 'mana_cost', 'converted_mana_cost',
                  'types', 'subtypes', 'expansion', 'card_text', 'p', 't',
                  'rarity',)
