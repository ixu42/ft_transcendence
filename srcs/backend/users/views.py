import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from functools import wraps
from users.forms import CustomUserCreationForm, AvatarUpdateForm
from users.models import CustomUser


def login_required_json(view_func):
    """
    Custom decorator that ensures the user is authenticated.
    Returns a 401 JSON response instead of redirecting.
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"errors": "User is not authenticated."}, status=401)
        return view_func(request, *args, **kwargs)

    return wrapper


@require_POST
def register_user(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        try:
            form.save()
            return JsonResponse({"message": "User created."}, status=201)
        except Exception as e:
            return JsonResponse({"errors": str(e)}, status=500)
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@require_POST
def login_user(request):
    if request.user.is_authenticated:
        return JsonResponse({"errors": "User is already logged in."}, status=400)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    username = body.get("username")
    password = body.get("password")

    if not username or not password:
        return JsonResponse(
            {"errors": "Username and password are required."}, status=400
        )

    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return JsonResponse({"errors": "Username does not exist."}, status=401)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({"message": "Login successful."}, status=200)
    else:
        return JsonResponse({"errors": "Invalid password."}, status=401)


@login_required_json
@require_POST
def logout_user(request):
    logout(request)
    return JsonResponse({"message": "Logout successful."}, status=200)


@login_required_json
@require_GET
def get_profile(request):
    participated_tournaments = request.user.created_tournaments.all()

    tournament_data = [
        {
            "id": tournament.id,
            "name": tournament.name,
            "status": tournament.status,
            "started_at": tournament.started_at,
        }
        for tournament in participated_tournaments
    ]

    return JsonResponse(
        {
            "username": request.user.username,
            "avatar": request.user.get_avatar(),
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "participated_tournaments": tournament_data,
            # wins and losses
            # friends
            # match history including 1v1 games, dates, and relevant details
        },
        status=200,
    )


@login_required_json
@require_POST
def update_avatar(request):
    if "avatar" not in request.FILES:
        return JsonResponse({"errors": "No file uploaded."}, status=400)

    form = AvatarUpdateForm(request.POST, request.FILES, instance=request.user)

    if form.is_valid():
        form.save()
        return JsonResponse(
            {
                "message": "Avatar updated.",
                "username": request.user.username,
                "avatar_url": request.user.avatar.url,
            },
            status=200,
        )

    return JsonResponse({"errors": form.errors}, status=400)
