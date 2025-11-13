
from django.contrib import admin
from .models import Checklist, ChecklistItem

class ChecklistItemInline(admin.TabularInline):
    model = ChecklistItem
    extra = 0

@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    inlines = [ChecklistItemInline]
    list_display = ("id","name","category","created_at","updated_at")
