from django.contrib import admin
from django.utils.html import mark_safe # to render HTML safely
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    """Register CustomUser model in the admin interface."""
    list_display = ('username', 'display_name', 'avatar', 'is_staff', 'is_active', 'date_joined')

    def avatar(self, obj):
        if obj.profile_picture:
            return mark_safe(f'<img src="{obj.profile_picture.url}" width="30" height="30" />')
        return 'No picture'

    search_fields = ('username', 'display_name')
    list_filter = ('is_staff', 'is_active')

admin.site.register(CustomUser, CustomUserAdmin)
