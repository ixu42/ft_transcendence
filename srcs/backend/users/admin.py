from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# register CustomUser model in the admin interface
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'display_name', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'display_name')
    list_filter = ('is_staff', 'is_active')

admin.site.register(CustomUser, CustomUserAdmin)
