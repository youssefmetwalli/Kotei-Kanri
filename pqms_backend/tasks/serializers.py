
from rest_framework import serializers
from .models import Task
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id","title","description","assignee","due_date","status","priority","checklist_name","created_at","updated_at"]
