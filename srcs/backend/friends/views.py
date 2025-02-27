from django.http import JsonResponse
from django.views.decorators.http import require_GET
from users.views import login_required_json


@login_required_json
@require_GET
def list_friends(request, user_id):
    user = request.user
    if user.id != user_id:
        return JsonResponse(
            {"errors": "You do not have permission to view friends of this user."},
            status=403,
        )

    friends = request.user.friends.values("id", "username", "avatar")
    return JsonResponse({"friends": list(friends)})
