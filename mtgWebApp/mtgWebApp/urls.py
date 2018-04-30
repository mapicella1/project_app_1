from django.contrib import admin
from django.conf.urls import url, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path


urlpatterns = [
    url('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('frontend.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
