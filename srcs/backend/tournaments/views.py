import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from functools import wraps
from .forms import TournamentCreationForm
from .models import Tournament

User = get_user_model()


def custom_login_required(view_func):
    """
    Custom decorator that ensures the user is authenticated.
    Returns a 401 JSON response instead of redirecting.
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_id = request.GET.get("user_id")
        if not user_id:
            return JsonResponse(
                {"errors": "Missing user_id query parameter."}, status=400
            )
        try:
            user_id = int(user_id)
            User.objects.get(id=user_id)
        except ValueError:
            return JsonResponse(
                {"errors": "Invalid user_id value passed in query param."}, status=400
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"errors": f"User not found with user_id {user_id}."}, status=404
            )

        cookie_name = f"session_{user_id}"
        session_cookie = request.COOKIES.get(cookie_name)

        # Check if the custom session cookie exists
        if not session_cookie:
            return JsonResponse({"errors": "User is not authenticated."}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper


@require_POST
@custom_login_required
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
                "message": "Tournament created",
                "tournament_id": tournament.id,
                "tournament_name": tournament.name,
            },
            status=201,
        )
    return JsonResponse({"errors": form.errors}, status=400)


@require_POST
@custom_login_required
def join_tournament(request, tournament_id):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        data = json.loads(request.body)
        tournament = Tournament.objects.get(id=tournament_id)
        display_name = data.get("display_name")
        tournament.add_player(user, display_name)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)
    except Tournament.DoesNotExist:
        return JsonResponse({"errors": "Tournament not found"}, status=404)
    except KeyError:
        return JsonResponse(
            {"errors": "Missing display_name field in request body."}, status=400
        )
    except ValidationError as e:
        return JsonResponse({"errors": str(e)}, status=400)

    return JsonResponse(
        {
            "message": f"{display_name} joined tournament",
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
        },
        status=201,
    )


@require_POST
@custom_login_required
def start_tournament(request, tournament_id):
    user_id = request.GET.get("user_id")
    user = User.objects.get(id=int(user_id))

    try:
        tournament = Tournament.objects.get(id=tournament_id)
        tournament.start(user)
    except Tournament.DoesNotExist:
        return JsonResponse({"errors": "Tournament not found"}, status=404)
    except ValidationError as e:
        return JsonResponse({"errors": str(e)}, status=400)

    return JsonResponse(
        {
            "message": "Tournament started",
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
        },
        status=201,
    )


@require_POST
@custom_login_required
def save_tournament_stats(request, tournament_id):
    pass
