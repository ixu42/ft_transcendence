from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django.contrib.auth import get_user_model
from .decorators import validate_user_id_path_param


@ensure_csrf_cookie
@require_GET
def homepage(request):
    return JsonResponse({"message": "hello from backend."})


@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})


@validate_user_id_path_param
@require_GET
def session_check(request, user_id):
    return JsonResponse({"status": "ok", "user_id": user_id})


def lockout(request, credentials, *args, **kwargs):
    return JsonResponse(
        {"errors": "Locked out due to too many login failures."}, status=403
    )


def custom_404(request, exception):
    return JsonResponse({"errors": "Page not found."}, status=404)


def custom_500(request):
    return JsonResponse({"errors": "Internal server error."}, status=500)


@require_GET
def guest_user_id(request):
    User = get_user_model()
    try:
        guest = User.objects.get(username="guest_player")
        return JsonResponse({"id": guest.id})
    except User.DoesNotExist:
        return JsonResponse({"errors": "Guest player not found."}, status=404)
