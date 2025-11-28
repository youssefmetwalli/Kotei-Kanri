
from rest_framework import serializers
from .models import Category, CheckItem, SystemSettings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id","name","description","created_at","updated_at"]

class CheckItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), write_only=True, allow_null=True, required=False)
    class Meta:
        model = CheckItem
        fields = ["id","name","type","category","category_id","required","unit","description","options","created_at","updated_at",
                    "tags","min_value","max_value","decimal_places","default_value","error_message","allow_handwriting","reference_image",
                  ]


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            "id",
            "system_name",
            "language",
            "timezone",
            "date_format",
            "user_name",
            "email",
            "role",
            "email_notifications",
            "task_notifications",
            "report_notifications",
            "system_alerts",
            "two_factor_auth",
            "session_timeout",
            "password_expiry",
            "auto_backup",
            "backup_frequency",
            "created_at",
            "updated_at",
        ]
