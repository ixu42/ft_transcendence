from django.urls import path, include
from . import views

app_name = "users"

urlpatterns = [
    # Authentication routes
    path("register/", views.register_user, name="register_user"),
    path("login/", views.login_user, name="login_user"),
    path("<int:user_id>/logout/", views.logout_user, name="logout_user"),
    # Profile routes
    path("<int:user_id>/", views.user_profile, name="user_profile"),
    path("<int:user_id>/password/", views.update_password, name="update_password"),
    path("<int:user_id>/avatar/", views.handle_avatar, name="handle_avatar"),
    # Anonymization
    path("<int:user_id>/anonymize/", views.anonymize_user, name="anonymize_user"),
    # Participated tournaments
    path(
        "<int:user_id>/tournaments-history/",
        views.participated_tournaments,
        name="participated_tournaments",
    ),
    # Match history
    path("<int:user_id>/match-history/", views.match_history, name="match_history"),
    # User scores
    path("<int:user_id>/scores/", views.user_scores, name="user_scores"),
    # Leaderboard route (all users info: basic user info + game stats)
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    # Friends
    path("<int:user_id>/friends/", include("friends.urls")),
    # Online status
    path("<int:user_id>/heartbeat/", views.heartbeat, name="heartbeat"),
    # Game routes
    path("<int:user_id>/games/", include("games.urls")),
    # Get data of all logged-in users
    path("", views.get_logged_in_users, name="get_logged_in_users"),
]
