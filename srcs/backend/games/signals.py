from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model


@receiver(
    post_migrate
)  # post_migrate signal is sent for every installed app after each migration
def create_guest_player(sender, **kwargs):
    """
    Ensures the guest player exists after migrations are applied.
    """
    if sender.name == "games":  # create_guest_player() runs only for games app
        User = get_user_model()
        guest, created = User.objects.get_or_create(
            username="guest_player",
            defaults={"is_active": False},
        )
        if created:
            print("Guest player created.")
