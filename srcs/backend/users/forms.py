from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from users.models import CustomUser


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("username", "password1", "password2")


class AvatarUpdateForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ("avatar",)


class ProfileUpdateForm(UserChangeForm):
    username = forms.CharField(max_length=50, required=False)
    email = forms.EmailField(required=False)
    first_name = forms.CharField(max_length=50, required=False)
    last_name = forms.CharField(max_length=50, required=False)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name")
