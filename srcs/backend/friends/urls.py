from django.urls import path
from . import views

app_name = "friends"

urlpatterns = [path("", views.list_friends, name="list_friends")]
