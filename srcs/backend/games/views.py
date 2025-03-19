import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_POST
from users.views import login_required_json
from django.contrib.auth import get_user_model
from .models import Game
from .forms import GameStatsForm, LocalGameForm

User = get_user_model()


@login_required_json
@require_POST
def create_local_game(request, user_id):
    user = User.objects.get(id=user_id)
    game = LocalGameForm().save(user=user, opponent="guest_player")

    return JsonResponse(
        {"message": "Local game created.", "game_id": game.id}, status=201
    )


@login_required_json
@require_POST
def create_ai_game(request, user_id):
    user = User.objects.get(id=user_id)
    game = LocalGameForm().save(user=user, opponent="AI")

    return JsonResponse({"message": "AI game created.", "game_id": game.id}, status=201)


@login_required_json
@require_http_methods(["PATCH"])
def save_game_stats(request, game_id, user_id):
    """
    Endpoint to save the stats for a completed game.
    Expects a PATCH request with player1_score and player2_score.
    """
    game = Game.objects.filter(id=game_id)
    if not game:
        return JsonResponse({"errors": "Game not found."}, status=404)

    game = game.first()  # queryset -> object

    user = User.objects.get(id=user_id)

    if user != game.player1 and user != game.player2:
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

    return JsonResponse({"message": "Game stats saved."})
