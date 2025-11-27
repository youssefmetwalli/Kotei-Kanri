
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from accounts.api import router as accounts_router
from master.api import router as master_router, SystemSettingsView
from checklists.api import router as checklists_router
from processes.api import router as processes_router
from executions.api import router as executions_router
from tasks.api import router as tasks_router

router = routers.DefaultRouter()
for r in [accounts_router, master_router, checklists_router, processes_router, executions_router, tasks_router]:
    for prefix, viewset, basename in getattr(r, 'registry', []):
        router.register(prefix, viewset, basename=basename)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('api/', include(router.urls)),
    path('api/auth/', include('accounts.auth_urls')),
    path('api/system-settings/', SystemSettingsView.as_view(), name='system-settings'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
