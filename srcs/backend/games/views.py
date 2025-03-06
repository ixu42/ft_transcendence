from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_POST
from users.views import login_required_json
import json
from .models import Game
from .forms import GameStatsForm, LocalGameForm


@login_required_json
@require_POST
def create_local_game(request):
    game = LocalGameForm().save(user=request.user)

    return JsonResponse(
        {"message": "Local game created.", "game_id": game.id}, status=201
    )


@login_required_json
@require_http_methods(["PATCH"])
def save_game_stats(request, game_id):
    """
    Endpoint to save the stats for a completed game.
    Expects a PATCH request with player1_score and player2_score.
    """
    game = Game.objects.filter(id=game_id)
    if not game:
        return JsonResponse({"errors": "Game not found."}, status=404)

    game = game.first()  # queryset -> object

    if request.user != game.player1 and request.user != game.player2:
        return JsonResponse({"errors": "You are not part of this game."}, status=403)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    form = GameStatsForm(data)
    if not form.is_valid():
        return JsonResponse({"errors": form.errors}, status=400)

    game = form.update_game(game)
    game.save()

    return JsonResponse({"message": "Game stats saved."}, status=200)
