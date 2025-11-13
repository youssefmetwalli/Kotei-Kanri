
from rest_framework import viewsets, routers
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import ProcessSheet
from .serializers import ProcessSheetSerializer

class ProcessSheetViewSet(viewsets.ModelViewSet):
    queryset = ProcessSheet.objects.select_related("checklist").all().order_by("-updated_at")
    serializer_class = ProcessSheetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status","assignee","priority","checklist"]
    search_fields = ["name","project_name","notes","assignee"]

router = routers.DefaultRouter()
router.register(r'process-sheets', ProcessSheetViewSet, basename='processsheet')
