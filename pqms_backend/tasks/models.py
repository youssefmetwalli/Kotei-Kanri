
from django.db import models
from common.models import TimeStampedModel

class Task(TimeStampedModel):
    STATUS_CHOICES = [("todo","未着手"),("doing","進行中"),("done","完了")]
    PRIORITY_CHOICES = [("low","低"),("medium","中"),("high","高")]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee = models.CharField(max_length=100, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="todo")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    checklist_name = models.CharField(max_length=200, blank=True)
    def __str__(self): return self.title
