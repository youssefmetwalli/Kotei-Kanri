
from django.contrib import admin
from .models import Execution, ExecutionItemResult, ExecutionPhoto

class ExecutionItemInline(admin.TabularInline):
    model = ExecutionItemResult
    extra = 0

@admin.register(Execution)
class ExecutionAdmin(admin.ModelAdmin):
    inlines = [ExecutionItemInline]
    list_display = ("id","checklist","process_sheet","executor","status","result","created_at")
admin.site.register(ExecutionPhoto)
