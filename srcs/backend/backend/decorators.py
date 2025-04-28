from functools import wraps
from django.http import JsonResponse
from django.contrib.auth import get_user_model

User = get_user_model()


def _get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except (ValueError, User.DoesNotExist):
        return None


def _has_valid_session_cookie(request, user_id):
    cookie_name = f"session_{user_id}"
    return request.COOKIES.get(cookie_name)


def _unauthorized_response(user_id):
    response = JsonResponse({"errors": "User is not authenticated."}, status=401)
    cookie_name = f"session_{user_id}"
    response.delete_cookie(cookie_name, path="/", domain="localhost")
    return response


def validate_user_id_path_param(view_func):
    """
    Decorator for validating user_id passed as path parameter.
    In case of 404 user not found, a 401 user not authenticated is returned for security reasons.
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        user_id = kwargs.get("user_id")
        if not user_id:
            return JsonResponse(
                {"errors": "user_id is required in the path."}, status=400
            )

        user = _get_user(user_id)
        if not user or not _has_valid_session_cookie(request, user_id):
            return _unauthorized_response(user_id)

        return view_func(request, *args, **kwargs)

    return wrapper


def validate_user_id_query_param(view_func):
    """
    Decorator for validating user_id passed as query parameter.
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
        except ValueError:
            return JsonResponse(
                {"errors": "Invalid user_id value passed in query param."}, status=400
            )

        user = _get_user(user_id)
        if not user:
            return _unauthorized_response(user_id)

        guest = User.objects.get(username="guest_player")
        if user_id != guest.id and not _has_valid_session_cookie(request, user_id):
            return _unauthorized_response(user_id)

        return view_func(request, *args, **kwargs)

    return wrapper
