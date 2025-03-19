from django.urls import path, include
from . import views

app_name = "users"

urlpatterns = [
    # Authentication routes
    path("register/", views.register_user, name="register_user"),
    path("login/", views.login_user, name="login_user"),
    path("logout/", views.logout_user, name="logout_user"),
    # Profile routes
    path("<int:user_id>/", views.user_profile, name="user_profile"),
    path("<int:user_id>/password/", views.update_password, name="update_password"),
    path("avatar/", views.update_avatar, name="update_avatar"),
    # Participated tournaments
    path(
        "<int:user_id>/tournaments/",
        views.participated_tournaments,
        name="participated_tournaments",
    ),
    # Match history
    path("<int:user_id>/match-history/", views.match_history, name="match_history"),
    # Leaderboard route (all users info: basic user info + game stats)
    path("leaderboard/", views.leaderboard, name="leaderboard"),
    # Friends
    path("<int:user_id>/friends/", include("friends.urls")),
    # Online status
    path("heartbeat/", views.heartbeat, name="heartbeat"),
]
