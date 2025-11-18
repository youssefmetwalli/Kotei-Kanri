
from django.db import models
from common.models import TimeStampedModel
from checklists.models import Checklist

class ProcessSheet(TimeStampedModel):
    STATUS_CHOICES = [
        ("planning","計画中"),
        ("preparing","実行準備中"),
        ("running","実行中"),
        ("done","完了"),
    ]
    name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    priority = models.IntegerField(default=3)
    assignee = models.CharField(max_length=100, blank=True)
    planned_start = models.DateField(null=True, blank=True)
    planned_end = models.DateField(null=True, blank=True)
    checklist = models.ForeignKey(Checklist, on_delete=models.SET_NULL, null=True, blank=True, related_name="process_sheets")
    notes = models.TextField(blank=True)
    lot_number = models.CharField(max_length=255, blank=True, default="")
    inspector = models.CharField(max_length=255, blank=True, default="")
    progress = models.IntegerField(default=0)  # 0–100 %

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return f"{self.name} ({self.get_status_display()})"
