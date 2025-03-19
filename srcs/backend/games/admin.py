from django.contrib import admin
from .models import Game


class GameAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "date_played",
        "get_player1",
        "get_player2",
        "get_winner",
        "player1_score",
        "player2_score",
    )
    list_filter = ("date_played", "winner")
    search_fields = ("player1__username", "player2__username", "winner__username")

    def get_player1(self, obj):
        return obj.player1.username if obj.player1 else "AI Player"

    def get_player2(self, obj):
        return obj.player2.username if obj.player2 else "AI Player"

    def get_winner(self, obj):
        if not obj.player1_score and not obj.player2_score:
            return None
        return obj.winner.username if obj.winner else "AI Player"

    get_player1.short_description = "Player 1"
    get_player2.short_description = "Player 2"
    get_winner.short_description = "Winner"


admin.site.register(Game, GameAdmin)
