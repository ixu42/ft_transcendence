from django.db import models
from django.conf import settings


class Game(models.Model):
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player1",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player2",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
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
        player1_name = self.player1.username if self.player1 else "AI"
        player2_name = self.player2.username if self.player2 else "AI"
        return (
            f"{player1_name} vs {player2_name} on {self.date_played}"
        )
