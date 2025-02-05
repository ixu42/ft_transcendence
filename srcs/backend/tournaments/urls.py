from django.urls import path
from . import views

app_name = 'tournaments'

urlpatterns = [
    path('create/', views.create_tournament, name='create_tournament'),
    path('<int:tournament_id>/join/', views.join_tournament, name='join_tournament'),
    path('<int:tournament_id>/start/', views.start_tournament, name='start_tournament'),
]
