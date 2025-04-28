import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods, require_POST
from users.views import custom_login_required
from django.contrib.auth import get_user_model
from .models import Game
from .forms import GameStatsForm, LocalGameForm
from tournaments.views import custom_login_required as custom_login_required_multi_users

User = get_user_model()


@custom_login_required
@require_POST
def create_local_game_guest(request, user_id):
    user = User.objects.get(id=user_id)
    guest = User.objects.get(username="guest_player")
    game = LocalGameForm().save(user=user, opponent=guest)

    return JsonResponse(
        {"message": "Local game created.", "game_id": game.id}, status=201
    )

@custom_login_required_multi_users
@require_POST
def create_local_game(request, user_id):
    user1 = User.objects.get(id=user_id)
    user2_id = request.GET.get("user_id")
    user2 = User.objects.get(id=int(user2_id))
    game = LocalGameForm().save(user=user1, opponent=user2)

    return JsonResponse(
        {"message": "Local game created.", "game_id": game.id}, status=201
    )

@custom_login_required
@require_POST
def create_ai_game(request, user_id):
    user = User.objects.get(id=user_id)
    game = LocalGameForm().save(user=user, opponent=None)

    return JsonResponse({"message": "AI game created.", "game_id": game.id}, status=201)


@custom_login_required
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
