from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from users.views import login_required_json
import json
from .models import Game


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

    try:
        player1_score = int(data.get("player1_score"))
        player2_score = int(data.get("player2_score"))
    except (TypeError, ValueError):
        return JsonResponse({"errors": "Invalid data provided."}, status=400)

    # Update game stats
    game.player1_score = player1_score
    game.player2_score = player2_score
    score_diff = player1_score - player2_score
    if score_diff > 0:
        game.winner = game.player1
    elif score_diff < 0:
        game.winner = game.player2
    else:
        game.winner = None
    game.save()

    return JsonResponse({"message": "Game stats saved."}, status=200)
