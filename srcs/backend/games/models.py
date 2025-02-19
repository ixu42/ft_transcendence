from django.db import models
from django.conf import settings


class Game(models.Model):
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player1",
        on_delete=models.CASCADE,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player2",
        on_delete=models.CASCADE,
    )
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date_played = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)

    def __str__(self):
        return (
            f"{self.player1.username} vs {self.player2.username} on {self.date_played}"
        )
