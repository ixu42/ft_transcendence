"""
Convert complex data into simple Python data types for easy rendering in
JSON, XML, or other formats.
"""

from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'display_name', 'profile_picture']
        extra_kwargs = {
            'password': {'write_only': True},  # Password should not be exposed in responses
            'profile_picture': {'required': False},  # Allow optional profile picture
        }
