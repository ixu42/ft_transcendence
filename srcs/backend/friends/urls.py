from django.urls import path
from . import views

app_name = "friends"

urlpatterns = [
    # list friend (GET) / send a friend request (POST)
    path("", views.friend_list_create, name="friend_list_create"),
    # List pending friend requests for a user
    path(
        "requests/",
        views.list_friend_requests,
        name="list_friend_requests",
    ),
    # Accept or reject a friend request
    path(
        "requests/<int:request_id>/",
        views.handle_friend_request,
        name="handle_friend_request",
    ),
]
