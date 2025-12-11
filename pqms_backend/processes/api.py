# processes/api.py
from rest_framework import viewsets, routers
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import ProcessSheet
from .serializers import ProcessSheetSerializer
from executions.models import Execution  # NEW

class ProcessSheetViewSet(viewsets.ModelViewSet):
    queryset = (
        ProcessSheet.objects
        .select_related("checklist")
        .all()
        .order_by("-updated_at")
    )
    serializer_class = ProcessSheetSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "assignee", "priority", "checklist"]
    search_fields = ["name", "project_name", "notes", "assignee"]

    # NEW: project-level progress (combined view)
    @action(detail=True, methods=["get"])
    def progress(self, request, pk=None):
        process_sheet = self.get_object()
        checklist = process_sheet.checklist

        total_items = checklist.items.count() if checklist else 0

        # all executions linked to this process sheet
        executions = (
            Execution.objects
            .filter(process_sheet=process_sheet)
            .prefetch_related("item_results__photos")
        )

        execution_summaries = []
        max_progress = 0

        for exe in executions:
            results = exe.item_results.all()
            # count finished items (anything that is not SKIP)
            completed = results.exclude(status="SKIP").count()
            progress = int(completed * 100 / total_items) if total_items else 0
            max_progress = max(max_progress, progress)

            execution_summaries.append(
                {
                    "id": exe.id,
                    "status": exe.status,
                    "result": exe.result,
                    "completed_items": completed,
                    "total_items": total_items,
                    "progress": progress,
                    "started_at": exe.started_at,
                    "finished_at": exe.finished_at,
                }
            )

        return Response(
            {
                "process_sheet_id": process_sheet.id,
                "total_items": total_items,
                # project-level = best (max) progress among executions
                "project_progress": max_progress if total_items else 0,
                "executions": execution_summaries,
            }
        )


router = routers.DefaultRouter()
router.register(r"process-sheets", ProcessSheetViewSet, basename="processsheet")
