
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
