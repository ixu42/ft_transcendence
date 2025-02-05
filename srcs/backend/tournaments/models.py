from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import CustomUser

class Tournament(models.Model):
    MAX_PLAYERS = 6
    class TournamentStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        ACTIVE = 'ACTIVE', _('Active')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELED = 'CANCELED', _('Canceled')

    name = models.CharField(max_length=50, blank=True)  # Name of the tournament
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    players = models.ManyToManyField(CustomUser, through='TournamentPlayer', related_name='tournaments')
    started_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=TournamentStatus.choices,
        default=TournamentStatus.PENDING,
    )

    def add_player(self, user, display_name):
        if self.status != Tournament.TournamentStatus.PENDING:
            raise ValueError('You cannot join a tournament that has already started or is completed or canceled.')
        if self.players.count() >= MAX_PLAYERS:
            raise ValueError('Tournament is full')
        if TournamentPlayer.objects.filter(tournament=self, display_name=display_name).exists():
            raise ValueError('Display name is already taken in this tournament. Choose another.')
        return TournamentPlayer.objects.create(tournament=self, user=user, display_name=display_name)

    def can_start(self):
        return self.players.count() >= 2 and self.status == Tournament.TournamentStatus.PENDING
        # check if even number of players?

    def __str__(self):
        return f"{self.name}, created by {self.creator}, status: {self.status}"

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=50)

    class Meta:
        # Enforce unique display name per tournament
        unique_together = ('tournament', 'display_name')
    
    def __str__(self):
        return f"{self.display_name} in {self.tournament.name}"
