from django.contrib import admin
from .models import Category, CheckItem, SystemSettings

admin.site.register(Category)
admin.site.register(CheckItem)

@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "system_name",
        "language",
        "timezone",
        "auto_backup",
        "backup_frequency",
        "updated_at",
    )
