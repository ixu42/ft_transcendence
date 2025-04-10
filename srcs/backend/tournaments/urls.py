from django.urls import path
from . import views

app_name = "tournaments"

urlpatterns = [
    # Create tournament (POST)
    path("", views.create_tournament, name="create_tournament"),
    # Join tournament (PATCH)
    path(
        "<int:tournament_id>/players/",
        views.join_tournament,
        name="join_tournament",
    ),
    # Start tournament (PATCH)
    path("<int:tournament_id>/start/", views.start_tournament, name="start_tournament"),
    # Save tournament stats (PATCH)
    path(
        "<int:tournament_id>/stats/",
        views.save_tournament_stats,
        name="save_tournament_stats",
    ),
]
