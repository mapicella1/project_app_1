import math
from random import randint
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render, redirect
from rest_framework import generics
from rest_framework.response import Response
from django.contrib.auth import login, authenticate
from .serializers import *
import json
from django.db.models import Q
from django.core.cache import cache
from django.contrib.auth.forms import UserCreationForm


# render home page
def home(request):
    return render(request, 'frontend/Home.html')


# render card page, check for authenticated user, isUser and card pk to card.html
def card(request, pk):
    context = {
        'isUser': request.user.is_authenticated,
        'id': pk,
    }
    return render(request, 'frontend/card.html', context)


# render deck page, check for authenticated user, redirect to access_denied page if not, else pass deck pk to deck.html
def deck(request, pk):
    deck_data = Deck.objects.get(deck_id=pk)
    deck_user = deck_data.user

    if request.user.is_authenticated and str(deck_user) == str(request.user.username):
        context = {
            'id': pk,
        }
        return render(request, 'frontend/deck.html', context)
    return render(request, 'frontend/access_denied.html')


# render shoe box page, check for authenticated user, redirect to access_denied page if not
def shoe_box(request):
    if request.user.is_authenticated:
        return render(request, 'frontend/shoe_box.html')
    return render(request, 'frontend/access_denied.html')


# render signup page
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'registration/signup.html', {'form': form})


# get specific card information for card page, returns card data and whether user is authenticated
class CardDetail(generics.ListCreateAPIView):
    def list(self, request, pk):
        card_data = CardTable.objects.filter(card_id__exact=pk)
        card_details = CardSerializer(card_data, many=True)
        context = {
            'card': card_details.data,
            'isUser': request.user.is_authenticated,
        }
        return Response(context)


# returns card id of transformation card or liked card on card page
class GetCardName(generics.ListCreateAPIView):
    def list(self, request, *args, **kwargs):
        card_name_request = request.GET.get('card_name')
        card_data = CardTable.objects.filter(card_name__exact=card_name_request)
        other_card_id = CardIdSerializer(card_data, many=True)
        return Response(other_card_id.data)


# return all of user's deck data
class GetDecks(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, *args, **kwargs):
        user_id = request.user.id
        deck_data = Deck.objects.filter(user_id__exact=user_id)
        deck_details = DeckSerializer(deck_data, many=True)
        return Response(deck_details.data)


# converts all numerical values from card_table rows 'converted_mana_cst',
# 'p', and 't' into integers for querying comparison operators
def get_num_cards():
    card_dict = {
        'converted_mana_cost': {
            'card_id': [],
            'converted_mana_cost': []
        },
        'p': {
            'card_id': [],
            'p': []
        },
        't': {
            'card_id': [],
            't': []
        },
    }
    cards = CardTable.objects.all()
    for i, val in enumerate(cards):
        try:
            card_dict['converted_mana_cost']['converted_mana_cost'].append(float(cards[i].converted_mana_cost.strip()))
            card_dict['converted_mana_cost']['card_id'].append(cards[i].card_id)
        except AttributeError:
            pass
        try:
            card_dict['p']['p'].append(float(cards[i].p.strip()))
            card_dict['p']['card_id'].append(cards[i].card_id)
        except (AttributeError, ValueError) as e:
            pass
        try:
            card_dict['t']['t'].append(float(cards[i].t.strip()))
            card_dict['t']['card_id'].append(cards[i].card_id)
        except (AttributeError, ValueError) as e:
            pass
    return card_dict


# queries numerical card_table rows against requested comparison operators
def eval_gte(card_nums, key, value):
    id_array = []
    for i, item in enumerate(card_nums[key][key]):
        if item >= value:
            id_array.append(card_nums[key]['card_id'][i])
    return id_array


def eval_lte(card_nums, key, value):
    id_array = []
    for i, item in enumerate(card_nums[key][key]):
        if item <= value:
            id_array.append(card_nums[key]['card_id'][i])
    return id_array


def eval_gt(cardNums, key, value):
    id_array = []
    for i, item in enumerate(cardNums[key][key]):
        if item > value:
            id_array.append(cardNums[key]['card_id'][i])
    return id_array


def eval_lt(card_nums, key, value):
    id_array = []
    for i, item in enumerate(card_nums[key][key]):
        if item < value:
            id_array.append(card_nums[key]['card_id'][i])
    return id_array


def build_query(card_nums, key, action, search_dict):

    filter = Q()
    for item in search_dict[key]:
        if key == 'p' or key == 't' or key == 'converted_mana_cost':
            if item[:2] == '>=':
                filter &= Q(**{'card_id__in': action.get('gte')(card_nums, key, int(item[2:]))})
            elif item[:2] == '<=':
                filter &= Q(**{'card_id__in': action.get('lte')(card_nums, key, int(item[2:]))})
            elif item[:1] == '>':
                filter &= Q(**{'card_id__in': action.get('gt')(card_nums, key, int(item[1:]))})
            elif item[:1] == '<':
                filter &= Q(**{'card_id__in': action.get('lt')(card_nums, key, int(item[1:]))})
            else:
                filter &= Q(**{key + '__icontains': item[1:]})
        elif key == 'expansion':
            if item[:1] == '*':
                filter &= Q(**{key + '__exact': item[1:]})
                filter |= Q(**{'all_sets__contains': item[1:]})
            elif item[:1] is '!':
                filter &= ~Q(**{key + '__icontains': item[1:]})
                filter |= Q(**{'all_sets__icontains': item[1:]})
            elif item[:1] is '|':
                filter |= Q(**{key + '__icontains': item[1:]})
                filter |= Q(**{'all_sets__icontains': item[1:]})
            else:
                filter &= Q(**{key + '__icontains': item})
                filter |= Q(**{'all_sets__icontains': item[1:]})
        else:
            if item[:1] == '*':
                filter &= Q(**{key + '__exact': item[1:]})
            elif item[:1] is '!':
                filter &= ~Q(**{key + '__exact': item[1:]})
            elif item[:1] is '|':
                filter |= Q(**{key + '__icontains': item[1:]})
            else:
                filter &= Q(**{key + '__icontains': item})
        return filter

# main search query
class GetCards(generics.ListCreateAPIView):
    def list(self, request, *args, **kwargs):
        # initialize action dict
        action = {
            'gte': eval_gte,
            'lte': eval_lte,
            'gt': eval_gt,
            'lt': eval_lt,
        }
        not_colors = ['Green', 'Red', 'Black', 'White', 'Blue']
        card_nums = get_num_cards()

        get_query = request.GET
        search_dict = {}

        # get keys from search request query and create those keys in the search_dict
        for key in get_query:
            # skip current loop if on 'page' or search' key
            if key in ('page', 'search'):
                continue
            result = request.GET.get(key)
            if result:
                # if 'format' then split into format type and legality to be queried against database
                if key == 'fmt':
                    for item in result.split():
                        new_items = item.split('_')
                        search_dict[new_items[0].lower()] = []
                        search_dict[new_items[0].lower()].append(new_items[1])
                # if expansion, add expansion name to 'all_sets' key for querying
                else:
                    if key == 'expansion':
                        search_dict['all_sets'] = []
                        for item in result.split():
                            search_dict['all_sets'].append('|' + item)
                        search_dict[key] = []
                        search_dict[key] = result.split()
                    else:
                        search_dict[key] = []
                        search_dict[key] = result.split()

        # get value of main search bar on homepage
        search = get_query['search']
        q_objects = Q(card_name__icontains=search)

        for key in search_dict:
            if key in ('page', 'search', 'fmt', 'all_sets'):
                continue
            q_objects.add(build_query(card_nums, key, action, search_dict), q_objects.AND)

        matching_cards = CardTable.objects.filter(q_objects).order_by('card_name').distinct('card_name')
        cards = CardSearchSerializer(matching_cards, many=True)

        # pagination of data by 100 cards per page
        card_count = len(cards.data)
        page_numbers = math.ceil(card_count / 100)
        page_num = int(get_query['page'])
        card_start = (page_num - 1) * 100
        card_end = ((page_num - 1) * 100) + 100
        # set card end to remaining cards, if cards on page is less than 100
        if card_end > len(cards.data):
            card_end = (len(cards.data) - ((page_num - 1) * 100)) + card_start
        page_cards = cards.data[card_start:card_end]

        # creates random session number to be attached to query chunk
        if 'number' in request.session:
            del request.session['number']
            request.session['number'] = str(randint(0, 100000))
        else:
            request.session['number'] = str(randint(0, 100000))

        # memcached library limits cache data to 1MB, this splits query into chunks of 3000
        # to allow storage within memchaced. each chunk is given a cache_key of current chunk
        # and randomly generated session number, for access by user
        if len(cards.data) > 3000:
            for i in range(0, math.ceil(len(cards.data)/3000)):
                cache_key = (request.session['number'] + str(i))
                cache_time = 36000
                data = cards.data[(i*3000):((i+1)*3000)]
                cache.set(cache_key, data, cache_time)
        else:
            cache_key = (request.session['number'] + '0')
            cache_time = 36000
            data = cards.data
            cache.set(cache_key, data, cache_time)

        context = {
            'data': page_cards,
            'cards': card_count,
            'pages': page_numbers,
            'curPage': page_num,
            'display': [card_start, card_end],
            'session': request.session['number'],
            'isUser': request.user.is_authenticated,
        }

        return Response(context)


# next page request, accessing data cached from initial card search. reverse math from initial
# search to find correct chunk and cards of requested page number
class GetPage(generics.ListCreateAPIView):
    def list(self, request):
        sess = request.GET.get('sess')
        page_num = int(request.GET.get('page'))
        chunk = math.floor(page_num / 31)

        cards = cache.get(sess + str(chunk))

        page = (page_num - (30*chunk))
        page_start = (page - 1) * 100
        page_end = ((page - 1) * 100) + 100
        if page_end > len(cards):
            page_end = (len(cards) - ((page - 1) * 100)) + page_start
        page_cards = cards[page_start:page_end]

        card_start = page_start + (3000*chunk)
        card_end = page_end + (3000*chunk)

        context = {
            'data': page_cards,
            'display': [card_start, card_end],
        }
        return Response(context)


# add card to deck_card table or shoe_box table at user_id or deck_id
class AddCard(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, deckPk, cardPk):
        user_id = request.user.id
        if deckPk == '0':
            card_data, found = ShoeBox.objects.get_or_create(card_id=cardPk, user_id=user_id)
        else:
            card_data, found = DeckCard.objects.get_or_create(card_id=cardPk, deck_id=deckPk)
        # return true if card exists in table, false if created from request
        return JsonResponse(found, safe=False)


#
class BulkAdd(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, *args, **kwargs):
        new_card_array = []
        data = json.loads(request.GET.get('update'))
        old_card_array = []
        quant_array = []
        deck_cards = DeckCard.objects.filter(deck_id=data['deckId'], card_id__in=data['oldCards'])
        # save previous deck_cards id of type into array
        for i, val in enumerate(deck_cards):
            old_card_array.append(deck_cards[i].card_id)
        for i, val in enumerate(data['cards']):
            try:
                # get all cards from request. create if doesn't exist, update quantities
                card = CardTable.objects.get(card_name__exact=val)
                new_card, created = DeckCard.objects.get_or_create(card_id=card.card_id, deck_id=data['deckId'])
                new_card_array.append(new_card.card_id)
                if data['quants'][i] == '0':
                    new_card.delete()
                else:
                    new_card.quantity = data['quants'][i]
                    new_card.save()
                    quant_array.append(data['quants'][i])
            except CardTable.DoesNotExist:
                # return error in card_name
                return JsonResponse([False, val, i], safe=False)
        remove_cards(new_card_array, old_card_array, data['deckId'])
        return Response([True])


# compare old cards of certain type in user's deck against newly
# saved cards, remove all old cards not included in request
def remove_cards(new_cards, old_cards, deck_id):
    for card in old_cards:
        if card in new_cards:
            pass
        else:
            old_card = DeckCard.objects.get(card_id=card, deck_id=int(deck_id))
            old_card.delete()


class UpdateQuant(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, deckPk, cardPk, quantity):
        card = DeckCard.objects.get(card_id=cardPk, deck_id=deckPk)
        if quantity == '0':
            card.delete()
            return JsonResponse(True, safe=False)
        else:
            card.quantity = quantity
            card.save()
            return JsonResponse(False, safe=False)


# update quantity of specific card
class UpdateDeckName(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, deckPk, name):
        user_id = request.user.id;
        deck = Deck.objects.get(deck_id=deckPk, user_id=user_id)
        deck.deck_name = name
        deck.save()
        return JsonResponse(True, safe=False)


# delete specific deck
class DeleteDeck(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, deckPk):
        user_id = request.user.id;
        deck = Deck.objects.get(deck_id=deckPk, user_id=user_id)
        deck.delete()
        return JsonResponse(True, safe=False)


# remove specific card from user's deck or shoe box
class RemoveCard(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, deckPk, cardPk):
        user_id = request.user.id
        if deckPk == '0':
            card = ShoeBox.objects.get(card_id=cardPk, user_id=user_id)
            card.delete()
        else:
            card = DeckCard.objects.get(card_id=cardPk, deck_id=deckPk)
            card.delete()
        return JsonResponse(True, safe=False)


# add new deck from user
class AddDeck(LoginRequiredMixin, generics.CreateAPIView):
    def get(self, request, string):
        user_id = request.user.id
        Deck.objects.get_or_create(deck_name=string, user_id=user_id)
        return JsonResponse('Added to database', safe=False)


# get current user's specific deck/shoe box cards
class GetUserCards(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, pk):
        cardArray = []
        if pk == '0':
            user_id = request.user.id
            qs = ShoeBox.objects.filter(user_id__exact=user_id)
        else:
            qs = DeckCard.objects.filter(deck_id__exact=pk)
        for i, val in enumerate(qs):
            cardArray.append(qs[i].card_id)
        queryset = CardTable.objects.filter(card_id__in=cardArray).order_by('card_name')
        serializer_class = CardSerializer(queryset, many=True)
        return Response(serializer_class.data)


# get deck card information for specific deck from current user
class DeckCards(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, pk):
        queryset = DeckCard.objects.filter(deck_id__exact=pk)
        serializer_class = DeckCardSerializer(queryset, many=True)
        return Response(serializer_class.data)


# get specific deck name
class GetDeckName(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, pk):
        queryset = Deck.objects.filter(deck_id__exact=pk)
        serializer_class = DeckSerializer(queryset, many=True)
        return Response(serializer_class.data)


# get data on all cards within specific deck from current user, render to deck.html
class DeckDetail(LoginRequiredMixin, generics.ListCreateAPIView):
    def list(self, request, pk):
        card_array = []
        deck_card_data = DeckCard.objects.filter(deck_id__exact=pk)
        for i, val in enumerate(deck_card_data):
            card_array.append(deck_card_data[i].card_id)
        cards = CardTable.objects.filter(card_id__in=card_array).order_by('card_name')
        return render(request, 'deck.html', {'cards': list(cards.values())})

