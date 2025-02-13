from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import mark_safe  # to render HTML safely
from .models import CustomUser


# register CustomUser model in the admin interface
class CustomUserAdmin(UserAdmin):
    list_display = (
        "id",
        "username",
        "avatar_preview",
        "is_staff",
        "is_active",
        "date_joined",
    )

    def avatar_preview(self, obj):
        return mark_safe(f'<img src="{obj.get_avatar()}" width="30" height="30" />')

    avatar_preview.short_description = "Avatar"
    list_filter = ("is_staff", "is_active")


admin.site.register(CustomUser, CustomUserAdmin)
