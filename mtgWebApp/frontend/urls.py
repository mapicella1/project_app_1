from django.urls import path
from . import views
from django.conf.urls import url
from django.contrib.auth import views as auth_views
# from mtgWebApp.frontend import views as core_views
from rest_framework.authtoken import views as rest_framework_views

urlpatterns = [
    path('', views.home, name="home"),
    url('card/(?P<pk>[0-9]+)$', views.card, name="card"),
    url('shoeBox/', views.shoe_box, name="shoe_box"),
    url('deck/(?P<pk>[0-9]+)$', views.deck, name="deck"),
    url('api/updateDeckName/(?P<deckPk>[0-9]+)/(?P<name>[a-zA-Z0-9_ ]+)$', views.UpdateDeckName.as_view()),
    url('api/deleteDeck/(?P<deckPk>[0-9]+)$', views.DeleteDeck.as_view()),
    path('api/cards/', views.GetCards.as_view()),
    path('api/cards/pages/', views.GetPage.as_view()),
    path('api/getCardName/', views.GetCardName.as_view()),
    path('api/userDecks/', views.GetDecks.as_view()),
    url('api/bulkAdd', views.BulkAdd.as_view()),
    url('api/userDeckName/(?P<pk>[0-9]+)$', views.GetDeckName.as_view()),
    url('api/getUserCards/(?P<pk>[0-9]+)$', views.GetUserCards.as_view()),
    url('api/DeckCards/(?P<pk>[0-9]+)$', views.DeckCards.as_view()),
    url('api/addCard/(?P<deckPk>[0-9]+)/(?P<cardPk>[0-9]+)$', views.AddCard.as_view()),
    url('api/addDeck/(?P<string>[a-zA-Z0-9_ ]+)$', views.AddDeck.as_view()),
    url('api/updateQuant/(?P<deckPk>[0-9]+)/(?P<cardPk>[0-9]+)/(?P<quantity>[0-9]+)$', views.UpdateQuant.as_view()),
    url('api/removeCard/(?P<deckPk>[0-9]+)/(?P<cardPk>[0-9]+)$', views.RemoveCard.as_view()),
    url('api/getCard/(?P<pk>[0-9]+)/$', views.CardDetail.as_view()),
    url(r'^login/$', auth_views.login, name='login'),
    url(r'^logout/$', auth_views.logout, name='logout'),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^get_auth_token/$', rest_framework_views.obtain_auth_token, name='get_auth_token'),
    url("^$", views.home, name="home"),
]