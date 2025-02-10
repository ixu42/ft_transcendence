from django.contrib.auth.forms import UserCreationForm
from django.forms import ModelForm
from users.models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("username", "password1", "password2")


class AvatarUpdateForm(ModelForm):
    class Meta:
        model = CustomUser
        fields = ("avatar",)
