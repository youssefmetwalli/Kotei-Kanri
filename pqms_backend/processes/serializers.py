
from rest_framework import serializers
from .models import ProcessSheet
from checklists.serializers import ChecklistSerializer
from checklists.models import Checklist

class ProcessSheetSerializer(serializers.ModelSerializer):
    checklist = ChecklistSerializer(read_only=True)
    checklist_id = serializers.PrimaryKeyRelatedField(source="checklist", queryset=Checklist.objects.all(), write_only=True, allow_null=True, required=False)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    class Meta:
        model = ProcessSheet
        fields = ["id","name","project_name","status","status_display","priority","assignee","planned_start","planned_end","checklist","checklist_id","notes","created_at","updated_at"]
