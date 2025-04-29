import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_http_methods
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from backend.decorators import validate_user_id_query_param
from .forms import TournamentCreationForm
from .models import Tournament

User = get_user_model()


@require_POST
@validate_user_id_query_param
def create_tournament(request):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    form = TournamentCreationForm(data)
    if form.is_valid():
        tournament = form.save(user=user)
        return JsonResponse(
            {
                "message": f"{user.username} created tournament.",
                "tournament_id": tournament.id,
                "tournament_name": tournament.name,
            },
            status=201,
        )
    return JsonResponse({"errors": form.errors}, status=400)


@require_http_methods(["PATCH"])
@validate_user_id_query_param
def join_tournament(request, tournament_id):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        tournament = Tournament.objects.get(id=tournament_id)
        tournament.add_player(user)
    except Tournament.DoesNotExist:
        return JsonResponse(
            {"errors": f"Tournament not found with tournament_id {tournament_id}."},
            status=404,
        )
    except ValidationError as e:
        return JsonResponse({"errors": str(e)}, status=400)

    return JsonResponse(
        {
            "message": f"{user.username} joined tournament.",
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
        },
    )


@require_http_methods(["PATCH"])
@validate_user_id_query_param
def start_tournament(request, tournament_id):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        tournament = Tournament.objects.get(id=tournament_id)
        tournament.start(user)
    except Tournament.DoesNotExist:
        return JsonResponse(
            {"errors": f"Tournament not found with tournament_id {tournament_id}."},
            status=404,
        )
    except ValidationError as e:
        return JsonResponse({"errors": str(e)}, status=400)

    return JsonResponse(
        {
            "message": "Tournament started.",
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
        },
    )


@require_http_methods(["PATCH"])
@validate_user_id_query_param
def save_tournament_stats(request, tournament_id):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        tournament = Tournament.objects.get(id=tournament_id)
        data = json.loads(request.body)
        winner_id = data.get("winner_id")
        if not winner_id:
            return JsonResponse(
                {"errors": "Missing winner_id field in request body."}, status=400
            )
        winner = User.objects.get(id=winner_id)
        tournament.save_stats(user, winner)
    except Tournament.DoesNotExist:
        return JsonResponse(
            {"errors": f"Tournament not found with tournament_id {tournament_id}."},
            status=404,
        )
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)
    except User.DoesNotExist:
        return JsonResponse(
            {"errors": f"Winner not found with winner_id {winner_id}."}, status=404
        )
    except ValidationError as e:
        return JsonResponse({"errors": str(e)}, status=400)

    return JsonResponse(
        {
            "message": "Tournament stats saved.",
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
        }
    )
