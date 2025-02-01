from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.http import JsonResponse
from users.forms import CustomUserCreationForm, UpdateDisplayNameForm
from users.models import CustomUser
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required


@csrf_exempt  # Remove in production, frontend should send CSRF token
@require_POST
def register_user(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'errors': 'Invalid JSON input'}, status=400)

    form = CustomUserCreationForm(data)
    if form.is_valid():
        try:
            form.save()
            return JsonResponse({'message': 'User created'}, status=201)
        except Exception as e:
            return JsonResponse({'errors': str(e)}, status=500)
    else:
        return JsonResponse({'errors': form.errors}, status=400)


@csrf_exempt
@require_POST
def login_user(request):
    body = json.loads(request.body)
    username = body.get('username')
    password = body.get('password')

    if not username or not password:
        return JsonResponse({'errors': 'Username and password are required.'}, status=400)

    try:
        user = CustomUser.objects.get(username=username)
    except CustomUser.DoesNotExist:
        return JsonResponse({'errors': 'Username does not exist'}, status=401)

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({'message': 'Login successful'}, status=200)
    else:
        return JsonResponse({'errors': 'Invalid password'}, status=401)


@csrf_exempt  # Remove in production, frontend should send CSRF token
@require_POST
@login_required
def set_display_name(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'errors': 'Invalid JSON input'}, status=400)

    form = UpdateDisplayNameForm(data, instance=request.user)
    current_display_name = request.user.display_name

    if form.is_valid():
        if form.cleaned_data['display_name'] == current_display_name:
            return JsonResponse(
                {'message': 'Display name is unchanged'},
                status=200
            )

        try:
            form.save()
            return JsonResponse({'message': 'Display name set'}, status=200)
        except Exception as e:
            return JsonResponse({'errors': str(e)}, status=500)
    else:
        return JsonResponse({'errors': form.errors}, status=400)
