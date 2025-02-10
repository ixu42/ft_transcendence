from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
import os


def user_avatar_upload_path(instance, filename):
    return os.path.join("avatars", str(instance.id), filename)


def validate_file_size(value):
    max_size = 3 * 1024 * 1024  # 3 MB
    if value.size > max_size:
        raise ValidationError(
            f"File size exceeds the limit {max_size / (1024 * 1024)} MB."
        )


class CustomUser(AbstractUser):
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path,
        blank=True,
        null=True,
        default="avatars/default.png",
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"]),
            validate_file_size,
        ],
    )

    def __str__(self):
        return f"'username': '{self.username}'"
