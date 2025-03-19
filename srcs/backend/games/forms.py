from django import forms
from django.contrib.auth import get_user_model
from .models import Game

User = get_user_model()


class LocalGameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ["player1", "player2"]

    def save(self, user, opponent, commit=True):
        game = super().save(
            commit=False
        )  # Create a Game model instance without saving to database yet

        if user:
            game.player1 = user
        if opponent == "AI":
            game.player2 = None
        else:
            game.player2 = User.objects.get(username="guest_player")

        if commit:
            game.save()
        return game


class GameStatsForm(forms.Form):
    player1_score = forms.IntegerField(min_value=0)
    player2_score = forms.IntegerField(min_value=0)

    def update_game(self, game):
        player1_score = self.cleaned_data["player1_score"]
        player2_score = self.cleaned_data["player2_score"]

        game.player1_score = player1_score
        game.player2_score = player2_score

        score_diff = player1_score - player2_score
        if score_diff > 0:
            game.winner = game.player1
        elif score_diff < 0:
            game.winner = game.player2
        else:
            game.winner = None
        
        game.completed = True

        return game
