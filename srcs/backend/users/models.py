from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    display_name = models.CharField(max_length=50, unique=True, blank=True)
    profile_picture = models.ImageField(upload_to='avatars/', blank=True, null=True, default='avatars/default.png')

    def __str__(self):
        return f"{{'username': '{self.username}', 'display_name': '{self.display_name}'}}"
