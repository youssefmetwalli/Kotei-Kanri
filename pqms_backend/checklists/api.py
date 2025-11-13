
from rest_framework import viewsets, routers
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Checklist, ChecklistItem
from .serializers import ChecklistSerializer, ChecklistItemReadSerializer

class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.all().prefetch_related("items__check_item","category").order_by("-updated_at")
    serializer_class = ChecklistSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]
    search_fields = ["name","description"]

class ChecklistItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChecklistItem.objects.select_related("checklist","check_item").all()
    serializer_class = ChecklistItemReadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["checklist"]

router = routers.DefaultRouter()
router.register(r'checklists', ChecklistViewSet, basename='checklist')
router.register(r'checklist-items', ChecklistItemViewSet, basename='checklistitem')
