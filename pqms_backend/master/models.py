
from django.db import models
from common.models import TimeStampedModel

class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    def __str__(self): return self.name

class CheckItem(TimeStampedModel):
    TYPE_CHOICES = [
        ("number","数値"),
        ("text","テキスト"),
        ("select","選択肢"),
        ("boolean","真偽"),
        ("photo","写真"),
    ]
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="text")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="check_items")
    required = models.BooleanField(default=False)
    unit = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    options = models.JSONField(default=list, blank=True)
    tags = models.CharField(max_length=255, blank=True)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    decimal_places = models.PositiveSmallIntegerField(default=0)
    default_value = models.FloatField(null=True, blank=True)
    error_message = models.CharField(max_length=255, blank=True)
    allow_handwriting = models.BooleanField(default=False)
    # base64 画像 or URL を保存するためのフィールド
    reference_image = models.TextField(blank=True)
    def __str__(self): return self.name


class SystemSettings(TimeStampedModel):
    system_name = models.CharField(max_length=200, default="工程・品質管理システム")
    language = models.CharField(max_length=10, default="ja")
    timezone = models.CharField(max_length=50, default="Asia/Tokyo")
    date_format = models.CharField(max_length=20, default="YYYY/MM/DD")

    user_name = models.CharField(max_length=100, default="山田太郎")
    email = models.EmailField(default="yamada@example.com")
    role = models.CharField(max_length=50, default="admin")

    email_notifications = models.BooleanField(default=True)
    task_notifications = models.BooleanField(default=True)
    report_notifications = models.BooleanField(default=False)
    system_alerts = models.BooleanField(default=True)

    two_factor_auth = models.BooleanField(default=False)
    session_timeout = models.PositiveIntegerField(default=60)  # minutes
    password_expiry = models.PositiveIntegerField(default=90)  # days

    auto_backup = models.BooleanField(default=True)
    backup_frequency = models.CharField(
        max_length=20,
        default="daily",
        choices=[
            ("hourly", "Hourly"),
            ("daily", "Daily"),
            ("weekly", "Weekly"),
            ("monthly", "Monthly"),
        ],
    )

    def __str__(self):
        return "System Settings"
