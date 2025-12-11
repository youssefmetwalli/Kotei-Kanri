# executions/api.py
from rest_framework import viewsets, routers
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Execution, ExecutionItemResult, ExecutionPhoto
from .serializers import (
    ExecutionSerializer,
    ExecutionItemResultReadSerializer,
    ExecutionPhotoSerializer,
)

class ExecutionViewSet(viewsets.ModelViewSet):
    queryset = (
        Execution.objects
        .select_related("checklist", "process_sheet", "executor")
        .prefetch_related("item_results__photos")
        .all()
        .order_by("-updated_at")
    )
    serializer_class = ExecutionSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "result", "checklist", "process_sheet", "executor"]
    search_fields = ["comment"]

    # NEW: execution-level progress & details
    @action(detail=True, methods=["get"])
    def progress(self, request, pk=None):
        execution = self.get_object()
        checklist = execution.checklist
        total_items = checklist.items.count() if checklist else 0

        results = (
            execution.item_results
            .select_related("checklist_item__check_item")
            .prefetch_related("photos")
            .all()
        )

        completed = results.exclude(status="SKIP").count()
        progress = int(completed * 100 / total_items) if total_items else 0

        detailed_results = []
        for r in results:
            detailed_results.append(
                {
                    "item_result_id": r.id,
                    "checklist_item_id": r.checklist_item_id,
                    "item_name": r.checklist_item.check_item.name,
                    "status": r.status,
                    "value": r.value,
                    "note": r.note,
                    "photos": [p.image.url for p in r.photos.all()],
                }
            )

        return Response(
            {
                "execution_id": execution.id,
                "status": execution.status,
                "result": execution.result,
                "completed_items": completed,
                "total_items": total_items,
                "progress": progress,
                "results": detailed_results,
            }
        )


class ExecutionItemResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExecutionItemResult.objects.select_related(
        "execution", "checklist_item"
    ).all()
    serializer_class = ExecutionItemResultReadSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["execution", "checklist_item", "status"]


class ExecutionPhotoViewSet(viewsets.ModelViewSet):
    queryset = ExecutionPhoto.objects.select_related("item_result").all()
    serializer_class = ExecutionPhotoSerializer
    permission_classes = [AllowAny]
    filterset_fields = ["item_result"]


router = routers.DefaultRouter()
router.register(r"executions", ExecutionViewSet, basename="execution")
router.register(
    r"execution-item-results",
    ExecutionItemResultViewSet,
    basename="executionitemresult",
)
router.register(
    r"execution-photos",
    ExecutionPhotoViewSet,
    basename="executionphoto",
)
