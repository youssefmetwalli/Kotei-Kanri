
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","email","display_name","department","is_active","is_staff"]
        read_only_fields = ["id","is_active","is_staff"]
