from django import forms
from .models import Tournament, TournamentPlayer


class TournamentCreationForm(forms.ModelForm):
    display_name = forms.CharField(
        max_length=50,
        required=True,
        help_text="This will be your name in the tournament.",
    )

    class Meta:
        model = Tournament
        fields = ["name", "display_name"]

    def save(self, user, commit=True):
        """Create a tournament and add the creator as a player."""
        tournament = super().save(commit=False)
        tournament.creator = user
        display_name = self.cleaned_data.get("display_name")
        if not tournament.name:
            tournament.name = f"{display_name}'s tournament"
        if commit:
            tournament.save()
            TournamentPlayer.objects.create(
                tournament=tournament, user=user, display_name=display_name
            )
        return tournament


class TournamentJoiningForm(forms.ModelForm):
    display_name = forms.CharField(
        max_length=50,
        required=True,
        help_text="This will be your name in the tournament.",
    )

    class Meta:
        model = Tournament
        fields = ["display_name"]
