from django.urls import path
from . import views

app_name = "friends"

urlpatterns = [
    path(
        "", views.friend_list_create, name="friend_list_create"
    ),  # list friend (GET) / send a friend request (POST)
]
