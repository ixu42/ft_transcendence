from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from users.views import custom_login_required


@ensure_csrf_cookie
@require_GET
def homepage(request):
    return JsonResponse({"message": "hello from backend."})


@ensure_csrf_cookie
@require_GET
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})


@custom_login_required
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
