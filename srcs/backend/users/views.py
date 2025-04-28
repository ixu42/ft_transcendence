import json
import os
import shutil
import re
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.contrib.auth import authenticate
from django.contrib.sessions.backends.db import SessionStore
from django.conf import settings
from django.db.models import Q
from functools import wraps
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.middleware.csrf import rotate_token, get_token
from users.forms import (
    CustomUserCreationForm,
    AvatarUpdateForm,
    ProfileUpdateForm,
    PasswordUpdateForm,
)
from games.models import Game

User = get_user_model()


def custom_login_required(view_func):
    """
    Custom decorator that ensures the user is authenticated.
    Returns a 401 JSON response instead of redirecting.
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_id = kwargs.get("user_id")  # Get user_id from route
        if not user_id:
            return JsonResponse(
                {"errors": "user_id is required in the route."}, status=400
            )

        cookie_name = f"session_{user_id}"
        session_cookie = request.COOKIES.get(cookie_name)

        # Check if the custom session cookie exists
        if not session_cookie:
            response = JsonResponse(
                {"errors": "User is not authenticated."}, status=401
            )
            response.delete_cookie(cookie_name, path="/", domain="localhost")
            return response

        try:
            User.objects.get(id=user_id)
        except User.DoesNotExist:
            response = JsonResponse(
                {"errors": f"User not found with user_id {user_id}."}, status=404
            )
            response.delete_cookie(cookie_name, path="/", domain="localhost")
            return response

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
        form.save()
        user_id = form.instance.id
        username = form.cleaned_data.get("username")
        return JsonResponse(
            {"id": user_id, "username": username, "message": "User created."},
            status=201,
        )
    else:
        return JsonResponse({"errors": form.errors}, status=400)


def custom_login(request, user, response, force_login=False):
    # Manually create a session for the user
    user_session = SessionStore()
    user_session["user_id"] = user.id
    user_session.create()  # Generate a unique session_key, and save session data to database

    cookie_name = "session_" + str(user.id)

    if cookie_name in request.COOKIES and not force_login:
        return JsonResponse({"errors": "User is already logged in."}, status=400)

    current_session_id = user_session.session_key
    response.set_cookie(
        cookie_name,
        current_session_id,
        httponly=True,
        secure=True,
        samesite="None",
        max_age=settings.SESSION_COOKIE_AGE,
    )
    rotate_token(
        request
    )  # Clear old csrf token and create a new one linked to new session
    csrf_token = get_token(request)
    response.set_cookie("csrftoken", csrf_token)
    return response


@require_POST
def login_user(request):
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
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"errors": "Username does not exist."}, status=401)
    
    if user.is_superuser:
        return JsonResponse(
              {"errors": "Invalid username/password."}, status=400
          )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse({"errors": "Invalid password."}, status=401)

    response = JsonResponse(
        {"id": user.id, "username": user.username, "message": "Login successful."}
    )
    return custom_login(request, user, response)


def custom_logout(request, user_id, response):
    session_cookie = request.COOKIES.get(f"session_{user_id}")
    SessionStore(session_cookie).delete()  # Delete session data from database
    response.delete_cookie(f"session_{user_id}")
    return response


@custom_login_required
@require_POST
def logout_user(request, user_id):
    username = User.objects.get(id=user_id).username
    response = JsonResponse(
        {"id": user_id, "username": username, "message": "Logout successful."}
    )
    return custom_logout(request, user_id, response)


@require_GET
def get_profile(request, user_id):
    user = User.objects.get(id=user_id)

    return JsonResponse(
        {
            "id": user.id,
            "username": user.username,
            "avatar": user.get_avatar(),
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "total_wins": user.total_wins,
            "total_losses": user.total_losses,
        }
    )


@require_http_methods(["PATCH"])
def update_profile(request, user_id):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    user = User.objects.get(id=user_id)
    form = ProfileUpdateForm(data, instance=user)

    if form.is_valid():
        form.save()
        response = JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "message": "User profile updated.",
            }
        )
        return custom_login(request, user, response, True)
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@require_http_methods(["DELETE"])
def delete_user_account(request, user_id):
    user = User.objects.get(id=user_id)
    username = user.username

    # If user has avatar in media directory, delete user's avatar and its related directory
    if user.avatar and user.avatar.name != user.default_avatar:
        user_folder = os.path.join(settings.MEDIA_ROOT, "avatars", str(user_id))
        if os.path.exists(user_folder):
            shutil.rmtree(user_folder)

    user.delete()  # Hard delete, remove the user instance and all related data from database

    response = JsonResponse(
        {"id": user_id, "username": username, "message": "Account deleted."}
    )
    return custom_logout(request, user_id, response)


@custom_login_required
@require_http_methods(["GET", "PATCH", "DELETE"])
def user_profile(request, user_id):
    if request.method == "GET":
        return get_profile(request, user_id)
    elif request.method == "PATCH":
        return update_profile(request, user_id)
    elif request.method == "DELETE":
        return delete_user_account(request, user_id)


@custom_login_required
@require_POST
def update_password(request, user_id):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    user = User.objects.get(id=user_id)
    form = PasswordUpdateForm(user, data)
    if form.is_valid():
        form.save()
        response = JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "message": "User password updated.",
            }
        )
        return custom_login(request, user, response, True)
    else:
        return JsonResponse({"errors": form.errors}, status=400)


@custom_login_required
@require_http_methods(["POST", "DELETE"])
def handle_avatar(request, user_id):
    user = User.objects.get(id=user_id)

    if request.method == "POST":
        if "avatar" not in request.FILES:
            return JsonResponse({"errors": "No file uploaded."}, status=400)

        old_file_path = user.avatar.name  # Store old file path for cleanup
        form = AvatarUpdateForm(request.POST, request.FILES, instance=user)

        if form.is_valid():
            user.update_avatar(form.cleaned_data.get("avatar"), old_file_path)
            return JsonResponse(
                {
                    "id": user.id,
                    "username": user.username,
                    "message": "Avatar updated.",
                    "avatar_url": user.get_avatar(),
                }
            )
        return JsonResponse({"errors": form.errors}, status=400)
    elif request.method == "DELETE":
        user.reset_avatar()
        return JsonResponse(
            {
                "id": user.id,
                "username": user.username,
                "message": "Avatar reset.",
                "avatar_url": user.get_avatar(),
            }
        )


@custom_login_required
@require_http_methods(["PATCH"])
def anonymize_user(request, user_id):
    user = User.objects.get(id=user_id)

    if user.is_anonymized:
        return JsonResponse({"errors": "User is already anonymized."}, status=400)

    user.anonymize()
    response = JsonResponse(
        {"message": "Your data has been anonymized. Logging out..."}
    )
    return custom_logout(request, user_id, response)


@custom_login_required
@require_GET
def participated_tournaments(request, user_id):
    user = User.objects.get(id=user_id)

    participated_tournaments = user.participated_tournaments.all()

    tournament_data = [
        {
            "id": tournament.id,
            "name": tournament.name,
            "status": tournament.status,
            "started_at": tournament.started_at,
            "players": tournament.get_players,
            "winner": tournament.winner.username if tournament.winner else None,
        }
        for tournament in participated_tournaments
    ]

    return JsonResponse({"participated_tournaments": tournament_data})


@custom_login_required
@require_GET
def match_history(request, user_id):
    user = User.objects.get(id=user_id)

    games = Game.objects.filter(Q(player1=user) | Q(player2=user)).order_by(
        "-date_played"
    )

    game_data = [
        {
            "game_id": game.id,
            "date_played": game.date_played,
            "player1": game.player1.username if game.player1 else "AI",
            "player2": game.player2.username if game.player2 else "AI",
            "winner": game.winner.username if game.winner else "AI",
            "player1_score": game.player1_score,
            "player2_score": game.player2_score,
        }
        for game in games
    ]

    return JsonResponse({"match_history": game_data})


@custom_login_required
@require_GET
def user_scores(request, user_id):
    user = User.objects.get(id=user_id)

    games1 = Game.objects.filter(Q(player1=user) & Q(completed=True))
    games2 = Game.objects.filter(Q(player2=user) & Q(completed=True))

    scores = 0

    for game in games1:
        scores += game.player1_score

    for game in games2:
        scores += game.player2_score

    return JsonResponse({
        "sum_of_scores": scores,
        "total_games": user.total_games      
    })


@require_GET
def leaderboard(request):
    users = User.objects.all()

    data = []
    for user in users:
        if user.username == "admin" or not user.is_active:
            continue

        data.append(
            {
                "id": user.id,
                "username": user.username,
                "avatar": user.get_avatar(),
                "total_wins": user.total_wins,
                "win_rate": user.win_rate,
            }
        )

    data.sort(key=lambda x: (-x["total_wins"], -x["win_rate"], x["id"]))

    for rank, user in enumerate(data, start=1):
        user["rank"] = rank

    return JsonResponse(data, safe=False)


# Heartbeat for online status
@custom_login_required
@require_GET
def heartbeat(request, user_id):
    user = User.objects.get(id=user_id)
    user.last_active = timezone.now()
    user.save(update_fields=["last_active"])
    return JsonResponse({"message": "Heartbeat updated."})


@require_GET
def get_logged_in_users(request):
    user_ids = []

    for cookie_name in request.COOKIES.keys():
        # match cookies with pattern like "session_1", "session_10" etc
        match = re.match(r'^session_(\d+)$', cookie_name)
        if match:
            user_id = match.group(1)
            user_ids.append(user_id)

    # query all users based on extracted user_ids
    users = User.objects.filter(id__in=user_ids)

    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'username': user.username,
        })

    return JsonResponse({'users': users_data})