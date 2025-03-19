from django.urls import path
from . import views

app_name = "friends"

urlpatterns = [
    # List friend (GET)
    path("", views.list_friends, name="list_friends"),
    # Send a friend request (POST) / List pending friend requests for a user (GET)
    path(
        "requests/",
        views.send_or_list_friend_request,
        name="send_or_list_friend_request",
    ),
    # Accept or reject a friend request (POST)
    path(
        "requests/<int:request_id>/",
        views.handle_friend_request,
        name="handle_friend_request",
    ),
    # Remove a friend (DELETE)
    path(
        "<int:friend_id>/",
        views.remove_friend,
        name="remove_friend",
    ),
]
