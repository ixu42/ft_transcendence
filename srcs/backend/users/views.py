from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomUserSerializer
from django.contrib.auth import authenticate, login

class RegisterUserView(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created'}, status=status.HTTP_201_CREATED)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginUserView(APIView):
    def post(self, request, format=None):
        data = request.data

        username = data.get('username', None)
        password = data.get('password', None)

        if not username or not password:
            return Response({'errors': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
            else:
                return Response({'errors': 'user account inactive'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'errors': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# from django.views.decorators.csrf import csrf_exempt
# from django.views.decorators.http import require_POST
# import json
# from django.http import JsonResponse
# from users.forms import CustomUserCreationForm
# from django.contrib.auth import authenticate, login
# from users.models import CustomUser

# # remove this exemption later
# # on the frontend, include the X-CSRFToken header ('X-CSRFToken': csrftoken) in the POST request, retrieving the token from the cookie
# @csrf_exempt
# @require_POST # restricts to only accept POST requests
# def register_user(request):
#     try:
#         data = json.loads(request.body)
#         display_name = data.get('display_name', '')
#         username = data.get('username')
#         if not display_name:
#             display_name = username
#             data['display_name'] = display_name
#         print(data)
#         print(display_name)
#     except json.JSONDecodeError:
#         return JsonResponse({'errors': 'Invalid JSON input'}, status=400)

#     form = CustomUserCreationForm(data)
#     if form.is_valid():
#         try:
#             form.save()
#             return JsonResponse({'message': 'User created'}, status=201)
#         except Exception as e:
#             return JsonResponse({'errors': str(e)}, status=500)
#     else:
#         return JsonResponse({'errors': form.errors}, status=400)

# @csrf_exempt
# @require_POST
# def login_user(request):
#     if request.method == 'POST':
#         body = json.loads(request.body)
#         username = body.get('username')
#         password = body.get('password')

#         if not username or not password:
#             return JsonResponse({'errors': 'Username and password are required.'}, status=400)

#         try:
#             user = CustomUser.objects.get(username=username)
#         except CustomUser.DoesNotExist:
#             return JsonResponse({'errors': 'Username does not exist'}, status=401)

#         user = authenticate(request, username=username, password=password)

#         if user is not None:
#             login(request, user)
#             return JsonResponse({'message': 'Login successful'}, status=200)
#         else:
#             return JsonResponse({'errors': 'Invalid password'}, status=401)