from django import forms


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

        return game