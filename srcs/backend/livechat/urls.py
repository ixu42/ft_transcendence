# livechat/urls.py
from django.urls import re_path
from . import consumers

# Single route for the shared chatroom
websocket_urlpatterns = [
    re_path(r"ws/chat/", consumers.ChatConsumer.as_asgi()),  # Static URL for chatroom
]
