from django.apps import AppConfig


class MtgWebAppConfig(AppConfig):
    name = 'mtgWebApp'

    def ready(self):
        import mtgWebApp.frontend.signals