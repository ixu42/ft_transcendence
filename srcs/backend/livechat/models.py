# livechat/models.py
from django.db import models
from django.contrib.auth.models import User


# Optional: You could create a ChatRoom model to separate chats into different rooms
class ChatRoom(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# The Message model will store messages sent by users
class Message(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )  # Linking the message to a user
    room = models.ForeignKey(
        ChatRoom, on_delete=models.CASCADE, related_name="messages"
    )  # Linking to a room (optional)
    content = models.TextField()  # The content of the message
    timestamp = models.DateTimeField(
        auto_now_add=True
    )  # Timestamp for when the message was created

    def __str__(self):
        return (
            f"Message from {self.user.username} in {self.room.name} at {self.timestamp}"
        )
