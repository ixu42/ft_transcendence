from django.contrib import admin
from django.utils.html import mark_safe  # to render HTML safely
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


# register CustomUser model in the admin interface
class CustomUserAdmin(UserAdmin):
    list_display = (
        "username",
        "avatar_preview",
        "is_staff",
        "is_active",
        "date_joined",
    )

    def avatar_preview(self, obj):
        if obj.avatar:
            return mark_safe(f'<img src="{obj.avatar.url}" width="30" height="30" />')
        return "No picture"

    avatar_preview.short_description = "Avatar"
    list_filter = ("is_staff", "is_active")


admin.site.register(CustomUser, CustomUserAdmin)
