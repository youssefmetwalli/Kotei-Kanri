
from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from checklists.models import Checklist, ChecklistItem
from processes.models import ProcessSheet

class Execution(TimeStampedModel):
    RESULT_CHOICES = [("pass","合格"),("fail","不合格"),("warn","要注意")]
    STATUS_CHOICES = [("draft","下書き"),("running","実行中"),("completed","完了"),("approved","承認済み"),("rejected","差戻し")]
    process_sheet = models.ForeignKey(ProcessSheet, on_delete=models.CASCADE, related_name="executions", null=True, blank=True)
    checklist = models.ForeignKey(Checklist, on_delete=models.PROTECT, related_name="executions")
    executor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES, blank=True)
    comment = models.TextField(blank=True)

class ExecutionItemResult(TimeStampedModel):
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE, related_name="item_results")
    checklist_item = models.ForeignKey(ChecklistItem, on_delete=models.PROTECT)
    status = models.CharField(max_length=10, choices=[("OK","OK"),("NG","NG"),("SKIP","スキップ")], default="OK")
    value = models.CharField(max_length=255, blank=True)
    note = models.TextField(blank=True)

class ExecutionPhoto(TimeStampedModel):
    item_result = models.ForeignKey(ExecutionItemResult, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="execution_photos/")
    annotation = models.TextField(blank=True)
