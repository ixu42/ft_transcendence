from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.http import JsonResponse
from users.forms import CustomUserCreationForm

# remove this exemption later
# on the frontend, include the X-CSRFToken header ('X-CSRFToken': csrftoken) in the POST request, retrieving the token from the cookie
@csrf_exempt
@require_POST # restricts to only accept POST requests
def register_user(request):
    try:
        data = json.loads(request.body)
        display_name = data.get('display_name', '')
        username = data.get('username')
        if not display_name:
            display_name = username
            data['display_name'] = display_name
        print(data)
        print(display_name)
    except json.JSONDecodeError:
        return JsonResponse({"errors": "Invalid JSON input"}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        try:
            form.save()
            return JsonResponse({"message": "User created"}, status=201)
        except Exception as e:
            return JsonResponse({"errors": str(e)}, status=500)
    else:
        return JsonResponse({'errors': form.errors}, status=400)