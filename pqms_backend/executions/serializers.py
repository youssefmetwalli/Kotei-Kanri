
from rest_framework import serializers
from .models import Execution, ExecutionItemResult, ExecutionPhoto
from checklists.serializers import ChecklistSerializer, ChecklistItemReadSerializer
from checklists.models import ChecklistItem, Checklist
from processes.serializers import ProcessSheetSerializer
from processes.models import ProcessSheet

class ExecutionPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionPhoto
        fields = ["id","image","annotation","created_at","updated_at"]

class ExecutionItemResultWriteSerializer(serializers.ModelSerializer):
    checklist_item_id = serializers.PrimaryKeyRelatedField(source="checklist_item", queryset=ChecklistItem.objects.all())
    photos = ExecutionPhotoSerializer(many=True, required=False, read_only=True)
    class Meta:
        model = ExecutionItemResult
        fields = ["id","checklist_item_id","status","value","note","photos"]

class ExecutionItemResultReadSerializer(serializers.ModelSerializer):
    checklist_item = ChecklistItemReadSerializer()
    photos = ExecutionPhotoSerializer(many=True, read_only=True)
    class Meta:
        model = ExecutionItemResult
        fields = ["id","checklist_item","status","value","note","photos"]

class ExecutionSerializer(serializers.ModelSerializer):
    checklist = ChecklistSerializer(read_only=True)
    checklist_id = serializers.PrimaryKeyRelatedField(source="checklist", queryset=Checklist.objects.all(), write_only=True)
    process_sheet = ProcessSheetSerializer(read_only=True)
    process_sheet_id = serializers.PrimaryKeyRelatedField(source="process_sheet", queryset=ProcessSheet.objects.all(), write_only=True, allow_null=True, required=False)
    item_results = ExecutionItemResultReadSerializer(many=True, read_only=True)
    item_results_write = ExecutionItemResultWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Execution
        fields = ["id","process_sheet","process_sheet_id","checklist","checklist_id","executor","started_at","finished_at","status","result","comment","item_results","item_results_write","created_at","updated_at"]
        read_only_fields = ["executor"]

    def create(self, validated_data):
        items_data = validated_data.pop("item_results_write", [])
        request = self.context.get("request")
        if request and request.user and not request.user.is_anonymous:
            validated_data.setdefault("executor", request.user)
        execution = super().create(validated_data)
        self._upsert_items(execution, items_data)
        return execution

    def update(self, instance, validated_data):
        items_data = validated_data.pop("item_results_write", None)
        execution = super().update(instance, validated_data)
        if items_data is not None:
            execution.item_results.all().delete()
            self._upsert_items(execution, items_data)
        return execution

    def _upsert_items(self, execution, items_data):
        for item in items_data:
            ExecutionItemResult.objects.create(execution=execution, **item)
