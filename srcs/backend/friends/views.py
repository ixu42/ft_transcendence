from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from users.views import login_required_json
from friends.models import FriendRequest
from users.models import CustomUser


# Send a friend request to the user with id specified in the url
@login_required_json
@require_POST
def send_friend_request(request, user_id):
    try:
        target_user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse(
            {"errors": "Recipient of the friend request not found."}, status=404
        )

    if target_user == request.user:
        return JsonResponse(
            {"errors": "You cannot send a friend request to yourself."}, status=400
        )

    existing_request = FriendRequest.objects.filter(
        sender=request.user, receiver=target_user, status="pending"
    ).first()
    if existing_request:
        return JsonResponse({"errors": "Friend request already sent."}, status=400)

    friend_request = FriendRequest(sender=request.user, receiver=target_user)
    friend_request.save()

    return JsonResponse({"message": "Friend request sent."}, status=201)


@login_required_json
@require_http_methods(["GET", "POST"])
def friend_list_create(request, user_id):
    if request.method == "GET":
        if request.user.id != user_id:
            return JsonResponse(
                {"errors": "You do not have permission to view friends of this user."},
                status=403,
            )
        friends = request.user.friends.values("id", "username", "avatar")
        return JsonResponse({"friends": list(friends)})
    else:
        return send_friend_request(request, user_id)


# List all the pending friend requests received by the logged-in user
@login_required_json
@require_GET
def list_friend_requests(request, user_id):
    user = request.user

    if user.id != user_id:
        return JsonResponse(
            {"errors": "You cannot view other users' friend requests."}, status=403
        )

    requests = FriendRequest.objects.filter(receiver=user, status="pending")
    request_list = [
        {"id": req.id, "sender": req.sender.username, "sent at": req.created_at}
        for req in requests
    ]

    return JsonResponse({"friend_requests": request_list}, safe=False)
