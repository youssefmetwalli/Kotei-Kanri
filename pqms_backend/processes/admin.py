from django.contrib import admin
from .models import ProcessSheet

@admin.register(ProcessSheet)
class ProcessSheetAdmin(admin.ModelAdmin):
    list_display = (
        "id", "name", "project_name", "lot_number", "inspector",
        "assignee", "status", "progress", "planned_end"
    )
    list_filter = ("status", "priority")
    search_fields = ("name", "project_name", "lot_number", "inspector", "assignee")
