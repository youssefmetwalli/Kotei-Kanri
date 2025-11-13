
from rest_framework import serializers
from .models import Category, CheckItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id","name","description","created_at","updated_at"]

class CheckItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(source="category", queryset=Category.objects.all(), write_only=True, allow_null=True, required=False)
    class Meta:
        model = CheckItem
        fields = ["id","name","type","category","category_id","required","unit","description","options","created_at","updated_at"]
