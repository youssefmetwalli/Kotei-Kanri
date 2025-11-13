
from django.db import models
from common.models import TimeStampedModel
from master.models import CheckItem, Category

class Checklist(TimeStampedModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self): return self.name

class ChecklistItem(TimeStampedModel):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name="items")
    check_item = models.ForeignKey(CheckItem, on_delete=models.PROTECT, related_name="used_in")
    order = models.PositiveIntegerField(default=0)
    required = models.BooleanField(default=False)
    instruction = models.TextField(blank=True)
    unit = models.CharField(max_length=50, blank=True)
    options = models.JSONField(default=list, blank=True)
    class Meta:
        ordering = ["order","id"]
        unique_together = ("checklist","check_item")
