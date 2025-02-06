import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate, login, logout
from users.forms import CustomUserCreationForm
from users.models import CustomUser


@csrf_exempt  # Remove in production, frontend should send CSRF token
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


@csrf_exempt
@require_POST
def login_user(request):
    if request.user.is_authenticated:
        return JsonResponse({"errors": "User is already authenticated."}, status=400)

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


@csrf_exempt
@require_POST
def logout_user(request):
    if request.user.is_authenticated:
        logout(request)
        return JsonResponse({"message": "Logout successful."}, status=200)
    else:
        return JsonResponse({"errors": "User is not authenticated."}, status=401)
