from django.contrib.auth import get_user_model


def get_deleted_user():
    """Returns the 'Deleted User' instance, creating it if necessary."""
    User = get_user_model()
    deleted_user, _ = User.objects.get_or_create(
        username="Deleted User", defaults={"is_active": False}
    )
    return deleted_user
