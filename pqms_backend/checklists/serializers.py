
from rest_framework import serializers
from .models import Checklist, ChecklistItem
from master.serializers import CategorySerializer, CheckItemSerializer
from master.models import Category, CheckItem

class ChecklistItemWriteSerializer(serializers.ModelSerializer):
    check_item_id = serializers.PrimaryKeyRelatedField(source="check_item", queryset=CheckItem.objects.all())
    class Meta:
        model = ChecklistItem
        fields = ["id","check_item_id","order","required","instruction","unit","options"]

class ChecklistItemReadSerializer(serializers.ModelSerializer):
    check_item = CheckItemSerializer()
    class Meta:
        model = ChecklistItem
        fields = ["id","check_item","order","required","instruction","unit","options"]

class ChecklistSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), write_only=True, allow_null=True, required=False)
    items = ChecklistItemReadSerializer(many=True, read_only=True)
    items_write = ChecklistItemWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Checklist
        fields = ["id","name","description","category","category_id","items","items_write","created_at","updated_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("items_write", [])
        checklist = super().create(validated_data)
        self._upsert_items(checklist, items_data)
        return checklist

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items_write", None)
        checklist = super().update(instance, validated_data)
        if items_data is not None:
            checklist.items.all().delete()
            self._upsert_items(checklist, items_data)
        return checklist

    def _upsert_items(self, checklist, items_data):
        for i, item in enumerate(items_data):
            ChecklistItem.objects.create(checklist=checklist, order=item.get("order", i), **item)
