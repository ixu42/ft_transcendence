from django.db import models
from django.conf import settings


class FriendRequest(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_friend_requests",
        on_delete=models.CASCADE,
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="received_friend_requests",
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ("pending", "Pending"),
            ("accepted", "Accepted"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def accept(self):
        """Accept the friend request and update the friends list"""
        self.status = "accepted"
        self.save()
        self.sender.friends.add(self.receiver)
        self.receiver.friends.add(self.sender)

    def reject(self):
        """Reject the friend request"""
        self.status = "rejected"
        self.save()
