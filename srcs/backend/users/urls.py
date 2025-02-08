from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path("register/", views.register_user, name="register_user"),
    path("login/", views.login_user, name="login_user"),
    path("logout/", views.logout_user, name="logout_user"),
    path("profile/", views.get_profile, name="get_profile"),
    # path("profile/", views.update_profile, name="update_profile"),
    # path("avatar/", views.update_avatar, name="update_avatar"),
]
