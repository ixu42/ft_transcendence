from django import forms
from django.contrib.auth.forms import UserCreationForm
from users.models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'password1', 'password2')


class UpdateDisplayNameForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['display_name']
    
    def clean_display_name(self):
        new_display_name = self.cleaned_data.get("display_name")
        user_instance = self.instance

        if not new_display_name:
            raise forms.ValidationError(
                "Display name is required to join tournaments."
            )

        if user_instance.display_name == new_display_name:
            return new_display_name

        if CustomUser.objects.exclude(pk=user_instance.pk).filter(display_name=new_display_name).exists():
            raise forms.ValidationError(
                "Display name already taken. Please choose another one."
            )

        return new_display_name
