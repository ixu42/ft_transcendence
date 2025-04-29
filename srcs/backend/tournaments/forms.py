from django import forms
from .models import Tournament


class TournamentCreationForm(forms.ModelForm):
    class Meta:
        model = Tournament
        fields = ["name"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Map "tournament_name" in the request data to "name"
        if "tournament_name" in self.data:
            self.data["name"] = self.data.get("tournament_name")
    
    def save(self, user, commit=True):
        """Create a tournament and add the creator as a player."""
        tournament = super().save(commit=False)
        tournament.creator = user
        if not tournament.name:
            tournament.name = f"{user.username}'s tournament"

        if commit:
            tournament.save()
            tournament.players.add(user)

        return tournament
