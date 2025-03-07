from django.apps import AppConfig
from importlib import import_module


class GamesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "games"

    def ready(self):  # Executed once when the app starts
        import_module(
            "games.signals"
        )  # Ensure signals are loaded when the app is ready
