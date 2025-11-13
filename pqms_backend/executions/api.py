
from rest_framework import viewsets, routers
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Execution, ExecutionItemResult, ExecutionPhoto
from .serializers import ExecutionSerializer, ExecutionItemResultReadSerializer, ExecutionPhotoSerializer

class ExecutionViewSet(viewsets.ModelViewSet):
    queryset = Execution.objects.select_related("checklist","process_sheet","executor").prefetch_related("item_results__photos").all().order_by("-updated_at")
    serializer_class = ExecutionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status","result","checklist","process_sheet","executor"]
    search_fields = ["comment"]

class ExecutionItemResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExecutionItemResult.objects.select_related("execution","checklist_item").all()
    serializer_class = ExecutionItemResultReadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["execution","checklist_item","status"]

class ExecutionPhotoViewSet(viewsets.ModelViewSet):
    queryset = ExecutionPhoto.objects.select_related("item_result").all()
    serializer_class = ExecutionPhotoSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["item_result"]

router = routers.DefaultRouter()
router.register(r'executions', ExecutionViewSet, basename='execution')
router.register(r'execution-item-results', ExecutionItemResultViewSet, basename='executionitemresult')
router.register(r'execution-photos', ExecutionPhotoViewSet, basename='executionphoto')
