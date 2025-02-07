from django.http import JsonResponse


def homepage(request):
    return JsonResponse({"message": "hello from backend"})


def lockout(request, credentials, *args, **kwargs):
    return JsonResponse({"error": "Locked out due to too many login failures."}, status=403)