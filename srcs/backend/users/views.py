# from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def register_user(request):
    return HttpResponse("Register a user")
    # return render(request, "users/register.html")