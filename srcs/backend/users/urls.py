from django.urls import path
from .views import RegisterUserView, LoginUserView

app_name = 'users'

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginUserView.as_view(), name='login'),
    # path('set-display-name/', SetDisplayNameView.as_view(), name='set_display_name'),
    # path('dashboard/', views.dashboard, name='dashboard'),
]
