from django import forms
from django.contrib.auth.forms import UserCreationForm
from users.models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    display_name = forms.CharField(max_length=50, required=False, initial='')

    class Meta:
        model = CustomUser
        fields = ('username', 'password1', 'password2', 'display_name')
