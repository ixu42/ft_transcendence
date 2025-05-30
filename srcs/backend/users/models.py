import os
import shutil
import uuid
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
    username = models.CharField(
        max_length=50,
        unique=True,
        error_messages={
            "unique": "A user with that username already exists.",
        },
    )
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path,
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"]),
            validate_file_size,
        ],
    )
    friends = models.ManyToManyField("self", symmetrical=True, blank=True)
    last_active = models.DateTimeField(null=True, blank=True)
    is_anonymized = models.BooleanField(default=False)

    @property
    def default_avatar(self):
        return static("avatars/default.png")

    @property
    def total_games(self):
        return Game.objects.filter(
            (models.Q(player1=self) | models.Q(player2=self)) & models.Q(completed=True)
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
        res = self.total_wins / self.total_games * 100
        return round(res, 1) if res > 0 else 0

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
        if old_file_path and old_file_path != self.default_avatar:
            if default_storage.exists(old_file_path):
                default_storage.delete(old_file_path)

        self.avatar = new_avatar
        self.save()

    def reset_avatar(self):
        """
        Resets the user's avatar to default and handles file cleanup.
        """
        user_avatar_folder = os.path.join(settings.MEDIA_ROOT, "avatars", str(self.id))
        if os.path.exists(user_avatar_folder):
            shutil.rmtree(user_avatar_folder)

        self.avatar = None
        self.save()

    def anonymize(self):
        """
        Anonymizes user data to comply with GDPR.
        """
        if self.is_anonymized:
            return

        # Generate a unique anonymous identifier
        anonymous_id = uuid.uuid4().hex[:8]

        # Replace personally identifiable information
        self.username = f"anonymous_{anonymous_id}"
        self.email = f"anonymous_{anonymous_id}@example.com"
        self.first_name = ""
        self.last_name = ""

        # Delete the entire user avatar folder if it exists
        user_avatar_folder = os.path.join(settings.MEDIA_ROOT, "avatars", str(self.id))
        if os.path.exists(user_avatar_folder):
            shutil.rmtree(user_avatar_folder)

        self.avatar = None

        self.friends.clear()

        self.set_unusable_password()
        self.is_active = False

        self.is_anonymized = True
        self.save()

    def save(self, *args, **kwargs):
        # Set default avatar if the instance is being created and no avatar is provided
        if not self.pk and not self.avatar:
            self.avatar = self.default_avatar

        super().save(*args, **kwargs)

    def __str__(self):
        return f"'username': '{self.username}'"
