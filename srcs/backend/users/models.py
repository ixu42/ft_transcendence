import os
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import default_storage
from django.templatetags.static import static
from django.conf import settings
from games.models import Game


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
    score = models.IntegerField(default=0)

    @property
    def default_avatar(self):
        return static("avatars/default.png")

    @property
    def total_games(self):
        return Game.objects.filter(
            models.Q(player1=self) | models.Q(player2=self)
        ).count()

    @property
    def total_wins(self):
        return Game.objects.filter(winner=self).count()

    @property
    def total_losses(self):
        return self.total_games - self.total_wins
    
    @property
    def win_rate(self):
        if self.total_games == 0:
            return 0
        return f"{self.total_wins / self.total_games * 100} %"

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

    def update_avatar(self, new_avatar, old_file_path):
        """
        Updates the user's avatar and handles file cleanup.
        """
        print(old_file_path)
        print(self.default_avatar)
        if old_file_path != self.default_avatar:
            if default_storage.exists(old_file_path):
                default_storage.delete(old_file_path)

        self.avatar = new_avatar
        self.save()

    def save(self, *args, **kwargs):
        # Set default avatar if the instance is being created and no avatar is provided
        if not self.pk and not self.avatar:
            self.avatar = self.default_avatar

        super().save(*args, **kwargs)

    def __str__(self):
        return f"'username': '{self.username}'"
