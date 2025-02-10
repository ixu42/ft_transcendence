from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def homepage(request):
    return JsonResponse({"message": "hello from backend."})


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set."})


def lockout(request, credentials, *args, **kwargs):
    return JsonResponse(
        {"error": "Locked out due to too many login failures."}, status=403
    )


def custom_404(request, exception):
    return JsonResponse({"error": "Page not found."}, status=404)


def custom_500(request):
    return JsonResponse({"error": "Internal server error."}, status=500)
