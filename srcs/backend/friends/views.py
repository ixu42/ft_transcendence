import json
from datetime import timedelta
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.contrib.auth import get_user_model
from backend.decorators import validate_user_id_path_param
from friends.models import FriendRequest

User = get_user_model()


@validate_user_id_path_param
@require_GET
def list_friends(request, user_id):
    user = User.objects.get(id=user_id)
    friends = list(user.friends.values("id", "username", "avatar", "last_active"))
    threshold = timezone.now() - timedelta(minutes=1)
    for friend in friends:
        friend["online"] = friend["last_active"] and friend["last_active"] >= threshold
    return JsonResponse({"friends": friends})


# Target user id passed as a query parameter
@require_POST
def send_friend_request(request, user_id):
    recipient_username = request.GET.get("recipient_username")

    if not recipient_username:
        return JsonResponse(
            {"errors": "Missing recipient_username query parameter."}, status=400
        )

    try:
        recipient = User.objects.get(username=recipient_username)
    except User.DoesNotExist:
        return JsonResponse(
            {"errors": "Recipient of the friend request not found."}, status=404
        )

    if recipient.friends.filter(id=user_id).exists():
        return JsonResponse({"errors": "Already friends with this user."}, status=400)

    user = User.objects.get(id=user_id)

    if recipient == user:
        return JsonResponse(
            {"errors": "You cannot send a friend request to yourself."}, status=400
        )

    existing_request = FriendRequest.objects.filter(
        sender=user, receiver=recipient, status="pending"
    ).first()
    if existing_request:
        return JsonResponse({"errors": "Friend request already sent."}, status=400)

    friend_request = FriendRequest(sender=user, receiver=recipient)
    friend_request.save()

    return JsonResponse({"message": "Friend request sent."}, status=201)


@validate_user_id_path_param
@require_http_methods(["POST", "GET"])
def send_or_list_friend_request(request, user_id):
    user = User.objects.get(id=user_id)

    if request.method == "POST":
        return send_friend_request(request, user_id)
    else:
        requests = FriendRequest.objects.filter(receiver=user, status="pending")
        request_list = [
            {"id": req.id, "sender": req.sender.username, "sent at": req.created_at}
            for req in requests
        ]

        return JsonResponse({"friend_requests": request_list}, safe=False)


@validate_user_id_path_param
@require_POST
def handle_friend_request(request, user_id, request_id):
    req = FriendRequest.objects.filter(id=request_id, status="pending")
    if not req:
        return JsonResponse({"errors": "friend request not found"}, status=404)

    friend_request = req.first()

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input."}, status=400)

    if data.get("accepted"):
        friend_request.accept()
        return JsonResponse({"message": "Friend request accepted."})
    else:
        friend_request.reject()
        return JsonResponse({"message": "Friend request rejected."})


# Remove a Friend
@validate_user_id_path_param
@require_http_methods(["DELETE"])
def remove_friend(request, user_id, friend_id):
    user = User.objects.get(id=user_id)

    friend = User.objects.filter(id=friend_id)

    if not friend:
        return JsonResponse(
            {"errors": f"friend user(id={friend_id}) not found"}, status=404
        )

    friend = friend.first()  # queryset -> object

    if not user.friends.filter(id=friend_id).exists():
        return JsonResponse(
            {"errors": f"Not friends with this user(id={friend_id})."}, status=400
        )

    user.friends.remove(friend)
    friend.friends.remove(user)
    return JsonResponse(data={}, status=204)  # Friend removed successfully
