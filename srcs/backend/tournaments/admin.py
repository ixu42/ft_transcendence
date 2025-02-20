from django.contrib import admin
from .models import Tournament


class TournamentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "get_creator", "get_players", "started_at", "status")
    list_filter = ("started_at", "status")
    search_fields = ("name",)

    def get_creator(self, obj):
        return obj.creator.username

    def get_players(self, obj):
        return ", ".join(player.username for player in obj.players.all())

    get_creator.short_description = "Creator"
    get_players.short_description = "Players"

    def has_add_permission(self, request):
        return False


admin.site.register(Tournament, TournamentAdmin)
