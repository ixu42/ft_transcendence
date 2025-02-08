from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.exceptions import ValidationError
from users.models import CustomUser


class Tournament(models.Model):
    MAX_PLAYERS = 6

    class TournamentStatus(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        ACTIVE = "ACTIVE", _("Active")
        COMPLETED = "COMPLETED", _("Completed")
        CANCELED = "CANCELED", _("Canceled")

    name = models.CharField(max_length=50, blank=True)  # Name of the tournament
    creator = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="created_tournaments"
    )
    players = models.ManyToManyField(
        CustomUser, through="TournamentPlayer", related_name="participated_tournaments"
    )
    started_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=TournamentStatus.choices,
        default=TournamentStatus.PENDING,
    )

    def check_status(self):
        if self.status == Tournament.TournamentStatus.ACTIVE:
            raise ValidationError("Tournament has already started")
        if self.status == Tournament.TournamentStatus.COMPLETED:
            raise ValidationError("Tournament has already completed")
        if self.status == Tournament.TournamentStatus.CANCELED:
            raise ValidationError("Tournament has been canceled")

    def add_player(self, user, display_name):
        self.check_status()
        if self.players.count() >= Tournament.MAX_PLAYERS:
            raise ValidationError("Tournament is full")
        if TournamentPlayer.objects.filter(tournament=self, user=user).exists():
            raise ValidationError("You are already in this tournament.")
        if TournamentPlayer.objects.filter(
            tournament=self, display_name=display_name
        ).exists():
            raise ValidationError(
                "Display name is already taken in this tournament. Choose another."
            )
        return TournamentPlayer.objects.create(
            tournament=self, user=user, display_name=display_name
        )

    def start(self, user):
        self.check_status()
        if self.players.count() < 2:
            raise ValidationError("Cannot start tournament with less than 2 players.")
        if user != self.creator:
            raise ValidationError("Only the creator of the tournament can start it.")
        self.status = Tournament.TournamentStatus.ACTIVE
        self.started_at = (
            timezone.now()
        )  # UTC time or user's local time (if interacting with the user)? Currently UTC
        self.save()

    def __str__(self):
        players = ", ".join([f"{player.username}" for player in self.players.all()])
        return (
            f"Tournament(name={self.name}, "
            f"creator={self.creator.username}, "
            f"status: {self.status}, started_at={self.started_at}, "
            f"players: {players}, "
            f"{self.players.count()}/{Tournament.MAX_PLAYERS} joined.)"
        )


class TournamentPlayer(models.Model):
    tournament = models.ForeignKey("Tournament", on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=50)

    class Meta:
        # Enforce unique display name per tournament
        unique_together = ("tournament", "display_name")

    def __str__(self):
        return f"{self.display_name} in {self.tournament.name}"
