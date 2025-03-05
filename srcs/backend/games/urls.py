from django.urls import path
from . import views

app_name = "games"

urlpatterns = [
    # Save the stats for a completed game (PATCH)
    path("<int:game_id>/stats/", views.save_game_stats, name="save_game_stats"),
]
