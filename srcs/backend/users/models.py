import os
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import default_storage
from django.templatetags.static import static
from django.conf import settings


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
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"]),
            validate_file_size,
        ],
    )

    @property
    def default_avatar(self):
        return static("avatars/default.png")

    def get_avatar(self):
        """
        Returns the URL of the user's avatar or the default avatar if the user
        has not uploaded a new avatar, or the previously uploaded avatar is deleted.
        """
        if self.avatar and os.path.exists(
            os.path.join(settings.MEDIA_ROOT, self.avatar.name)
        ):
            return self.avatar.url
        return self.default_avatar

    def save(self, *args, **kwargs):
        try:
            old_instance = CustomUser.objects.get(pk=self.pk)
            if old_instance.avatar != self.avatar:
                default_storage.delete(old_instance.avatar.path)
        except CustomUser.DoesNotExist:
            pass  # No previous instance, so no file to delete

        super().save(*args, **kwargs)

    def __str__(self):
        return f"'username': '{self.username}'"
