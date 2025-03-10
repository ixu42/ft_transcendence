from django.contrib.auth.forms import UserCreationForm, UserChangeForm, SetPasswordForm
from django import forms
from django.contrib.auth.hashers import check_password
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
    password = None
    username = forms.CharField(max_length=50, required=False)
    email = forms.EmailField(required=False)
    first_name = forms.CharField(max_length=50, required=False)
    last_name = forms.CharField(max_length=50, required=False)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name")


class PasswordUpdateForm(SetPasswordForm):
    class Meta:
        model = CustomUser
        fields = ["old_password", "new_password1", "new_password2"]

    def clean_old_password(self):
        old_password = self.cleaned_data.get("old_password")

        if not check_password(old_password, self.user.password):
            raise forms.ValidationError("Old password is incorrect.")

        return old_password

    def clean_new_password1(self):
        new_password = self.cleaned_data.get("new_password1")

        if check_password(new_password, self.user.password):
            raise forms.ValidationError(
                "New password cannot be the same as the old one."
            )

        return new_password
